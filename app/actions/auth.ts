'use server'

import { prisma } from '@/lib/prisma'
import { sendOTP } from '@/lib/sms'
import { sendEmailOTP } from '@/lib/email'
import { createSession } from '@/lib/session'
import { z } from 'zod'
import crypto from 'crypto'

const requestOtpSchema = z.object({
  contactMethod: z.enum(['sms', 'email']),
  contactValue: z.string(),
  captchaToken: z.string().min(1, 'กรุณายืนยันตัวตนว่าไม่ใช่บอท'),
}).refine((data) => {
  if (data.contactMethod === 'sms') {
    return /^0[0-9]{9}$/.test(data.contactValue)
  }
  if (data.contactMethod === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactValue)
  }
  return false
}, {
  message: 'รูปแบบข้อมูล (เบอร์โทรหรืออีเมล) ไม่ถูกต้อง',
  path: ['contactValue'],
})

export async function requestOtpAction(prevState: any, formData: FormData) {
  try {
    const parsed = requestOtpSchema.safeParse({
      contactMethod: formData.get('contactMethod'),
      contactValue: formData.get('contactValue'),
      captchaToken: formData.get('captchaToken'),
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const { contactMethod, contactValue, captchaToken } = parsed.data

    // Verify Turnstile
    if (process.env.NODE_ENV === 'production' || process.env.TURNSTILE_SECRET_KEY) {
      const captchaResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA',
          response: captchaToken,
        }),
      })
      const captchaResult = await captchaResponse.json()
      if (!captchaResult.success) {
        return { error: 'การยืนยันตัวตนล้มเหลว (CAPTCHA) กรุณาลองใหม่' }
      }
    }

    let voter = await prisma.voter.findFirst({
      where: contactMethod === 'sms' ? { phoneNumber: contactValue } : { email: contactValue }
    })

    if (voter) {
      // Check Rate Limit (max 3 times in 15 minutes)
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000)
      const recentRequests = await prisma.otpVerification.count({
        where: {
          voterId: voter.id,
          createdAt: { gte: fifteenMinsAgo }
        }
      })

      if (recentRequests >= 3) {
        return { error: 'คุณขอรหัส OTP บ่อยเกินไป กรุณารอ 15 นาที' }
      }
    } else {
      voter = await prisma.voter.create({
        data: contactMethod === 'sms' ? { phoneNumber: contactValue } : { email: contactValue }
      })
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpCodeHash = crypto.createHash('sha256').update(otpCode).digest('hex')
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await prisma.otpVerification.create({
      data: {
        voterId: voter.id,
        otpCodeHash,
        expiresAt,
      }
    })

    let sendSuccess = false
    if (contactMethod === 'sms') {
      sendSuccess = await sendOTP(contactValue, otpCode)
    } else {
      sendSuccess = await sendEmailOTP(contactValue, otpCode)
    }

    if (!sendSuccess) {
      return { error: 'ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่อีกครั้ง' }
    }

    return { success: true, contactMethod, contactValue }
  } catch (error) {
    console.error('Request OTP Error:', error)
    return { error: 'เกิดข้อผิดพลาดในการขอ OTP กรุณาลองใหม่อีกครั้ง' }
  }
}

export async function verifyOtpAction(prevState: any, formData: FormData) {
  try {
    const contactMethod = formData.get('contactMethod') as string
    const contactValue = formData.get('contactValue') as string
    const otpCode = formData.get('otpCode') as string
    const eventId = formData.get('eventId') as string

    if (!contactValue || !otpCode || otpCode.length !== 6 || !['sms', 'email'].includes(contactMethod)) {
      return { error: 'ข้อมูลไม่ถูกต้อง' }
    }

    const voter = await prisma.voter.findFirst({
      where: contactMethod === 'sms' ? { phoneNumber: contactValue } : { email: contactValue }
    })

    if (!voter) {
      return { error: 'ไม่พบข้อมูลผู้ใช้' }
    }

    const latestOtp = await prisma.otpVerification.findFirst({
      where: {
        voterId: voter.id,
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!latestOtp) {
      return { error: 'ไม่พบคำขอ OTP หรือ OTP ถูกใช้ไปแล้ว' }
    }

    if (new Date() > latestOtp.expiresAt) {
      return { error: 'รหัส OTP หมดอายุแล้ว' }
    }

    if (latestOtp.attempts >= 5) {
      return { error: 'คุณใส่รหัสผิดเกินจำนวนครั้งที่กำหนด กรุณาขอ OTP ใหม่' }
    }

    const inputHash = crypto.createHash('sha256').update(otpCode).digest('hex')

    if (inputHash !== latestOtp.otpCodeHash) {
      await prisma.otpVerification.update({
        where: { id: latestOtp.id },
        data: { attempts: { increment: 1 } }
      })
      return { error: 'รหัส OTP ไม่ถูกต้อง' }
    }

    await prisma.otpVerification.update({
      where: { id: latestOtp.id },
      data: { consumedAt: new Date() }
    })

    if (!voter.isVerified) {
      await prisma.voter.update({
        where: { id: voter.id },
        data: { isVerified: true }
      })
    }

    await createSession(voter.id, contactValue)

    return { success: true, redirectUrl: eventId ? `/vote/cast?eventId=${eventId}` : '/vote/cast' }
  } catch (error) {
    console.error('Verify OTP Error:', error)
    return { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }
  }
}
