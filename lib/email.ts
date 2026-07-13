import 'server-only'
import nodemailer from 'nodemailer'

export async function sendEmailOTP(email: string, otpCode: string): Promise<boolean> {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || 'no-reply@example.com'

  if (process.env.NODE_ENV !== 'production' && !host) {
    console.log('\n=========================================')
    console.log(`📧 MOCK EMAIL TO: ${email}`)
    console.log(`🔑 OTP CODE: ${otpCode}`)
    console.log('=========================================\n')
    return true
  }

  if (!host || !user || !pass) {
    console.error('Missing SMTP credentials')
    return false
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    })

    const info = await transporter.sendMail({
      from: `"MHC9 Vote System" <${from}>`,
      to: email,
      subject: 'รหัส OTP สำหรับยืนยันการโหวต MHC9',
      text: `รหัส OTP สำหรับยืนยันการโหวตของคุณคือ: ${otpCode} (มีอายุ 5 นาที)`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; text-align: center; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #00f6ff; margin-bottom: 5px;">MHC9 POPULAR VOTE</h2>
          <p style="color: #555;">รหัส OTP สำหรับยืนยันตัวตนของคุณคือ:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; color: #333;">
            ${otpCode}
          </div>
          <p style="color: #777; font-size: 13px;">รหัสนี้มีอายุ 5 นาที โปรดอย่านำรหัสนี้ไปให้บุคคลอื่น</p>
        </div>
      `,
    })

    console.log('Email sent: %s', info.messageId)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}
