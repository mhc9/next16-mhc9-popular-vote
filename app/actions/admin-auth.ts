'use server'

import { prisma } from '@/lib/prisma'
import { createAdminSession, deleteAdminSession } from '@/lib/admin-session'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const loginSchema = z.object({
  username: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้งาน'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
})

export async function loginAdminAction(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = loginSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { username: parsed.data.username },
    })

    if (!adminUser || !adminUser.isActive) {
      return { error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' }
    }

    const isValid = await bcrypt.compare(parsed.data.password, adminUser.passwordHash)
    
    if (!isValid) {
      return { error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' }
    }

    await createAdminSession(adminUser.id, adminUser.username, adminUser.role)
    
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }
  }

  // Redirect after setting session cookie
  redirect('/admin')
}

export async function logoutAdminAction() {
  await deleteAdminSession()
  redirect('/admin/login')
}
