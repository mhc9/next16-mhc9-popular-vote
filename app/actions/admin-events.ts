'use server'

import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const eventSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อกิจกรรม'),
  qrToken: z.string().min(1, 'กรุณาระบุ Token สำหรับ QR Code'),
  startAt: z.string().min(1, 'กรุณาระบุวันที่เริ่มต้น'),
  endAt: z.string().min(1, 'กรุณาระบุวันที่สิ้นสุด'),
  isOpen: z.string().optional(),
})

export async function createEventAction(prevState: any, formData: FormData) {
  const session = await getAdminSession()
  if (!session) return { error: 'Unauthorized' }

  const data = Object.fromEntries(formData)
  const parsed = eventSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    const existingToken = await prisma.voteEvent.findUnique({
      where: { qrToken: parsed.data.qrToken }
    })

    if (existingToken) {
      return { error: 'QR Token นี้มีในระบบแล้ว กรุณาใช้ Token อื่น' }
    }

    await prisma.voteEvent.create({
      data: {
        name: parsed.data.name,
        qrToken: parsed.data.qrToken,
        startAt: new Date(parsed.data.startAt),
        endAt: new Date(parsed.data.endAt),
        isOpen: parsed.data.isOpen === 'on',
      }
    })

    revalidatePath('/admin/events')
    revalidatePath('/admin')
  } catch (error) {
    console.error('Create event error:', error)
    return { error: 'เกิดข้อผิดพลาดในการบันทึกกิจกรรม' }
  }

  redirect('/admin/events')
}

export async function updateEventAction(prevState: any, formData: FormData) {
  const session = await getAdminSession()
  if (!session) return { error: 'Unauthorized' }

  const id = formData.get('id') as string
  const data = Object.fromEntries(formData)
  const parsed = eventSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    const existing = await prisma.voteEvent.findUnique({
      where: { id }
    })

    if (!existing) {
      return { error: 'ไม่พบข้อมูลกิจกรรม' }
    }

    if (parsed.data.qrToken !== existing.qrToken) {
      const existingToken = await prisma.voteEvent.findUnique({
        where: { qrToken: parsed.data.qrToken }
      })

      if (existingToken) {
        return { error: 'QR Token นี้มีในระบบแล้ว กรุณาใช้ Token อื่น' }
      }
    }

    await prisma.voteEvent.update({
      where: { id },
      data: {
        name: parsed.data.name,
        qrToken: parsed.data.qrToken,
        startAt: new Date(parsed.data.startAt),
        endAt: new Date(parsed.data.endAt),
        isOpen: parsed.data.isOpen === 'on',
      }
    })

    revalidatePath('/admin/events')
    revalidatePath('/admin')
  } catch (error) {
    console.error('Update event error:', error)
    return { error: 'เกิดข้อผิดพลาดในการอัปเดตกิจกรรม' }
  }

  redirect('/admin/events')
}

export async function deleteEventAction(formData: FormData) {
  const session = await getAdminSession()
  if (!session) throw new Error('Unauthorized')

  const id = formData.get('id') as string
  if (!id) throw new Error('Missing ID')

  try {
    // Delete associated votes first
    await prisma.vote.deleteMany({
      where: { voteEventId: id }
    })
    
    await prisma.voteEvent.delete({
      where: { id }
    })
    
    revalidatePath('/admin/events')
    revalidatePath('/admin')
  } catch (error) {
    console.error('Delete event error:', error)
    throw new Error('Failed to delete event')
  }
}
