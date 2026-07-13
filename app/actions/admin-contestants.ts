'use server'

import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const contestantSchema = z.object({
  id: z.string().min(1, 'กรุณาระบุรหัสผู้เข้าแข่งขัน'),
  fullName: z.string().min(1, 'กรุณาระบุชื่อ-สกุล'),
  position: z.string().min(1, 'กรุณาระบุตำแหน่ง'),
  department: z.string().min(1, 'กรุณาระบุหน่วยงาน'),
  projectTitle: z.string().min(1, 'กรุณาระบุชื่อผลงาน'),
  projectDesc: z.string().min(1, 'กรุณาระบุรายละเอียดผลงาน'),
  photoUrl: z.string().url('URL รูปภาพไม่ถูกต้อง').min(1, 'กรุณาระบุ URL รูปภาพ'),
})

export async function createContestantAction(prevState: any, formData: FormData) {
  const session = await getAdminSession()
  if (!session) return { error: 'Unauthorized' }

  const data = Object.fromEntries(formData)
  const parsed = contestantSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    const existing = await prisma.contestant.findUnique({
      where: { id: parsed.data.id }
    })

    if (existing) {
      return { error: 'รหัสผู้เข้าแข่งขันนี้มีอยู่ในระบบแล้ว' }
    }

    await prisma.contestant.create({
      data: parsed.data
    })

    revalidatePath('/admin/contestants')
    revalidatePath('/results')
    revalidatePath('/')
  } catch (error) {
    console.error('Create error:', error)
    return { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }
  }

  redirect('/admin/contestants')
}

export async function updateContestantAction(prevState: any, formData: FormData) {
  const session = await getAdminSession()
  if (!session) return { error: 'Unauthorized' }

  const originalId = formData.get('originalId') as string
  const data = Object.fromEntries(formData)
  const parsed = contestantSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    if (parsed.data.id !== originalId) {
      const existing = await prisma.contestant.findUnique({
        where: { id: parsed.data.id }
      })
      if (existing) {
        return { error: 'รหัสผู้เข้าแข่งขัน (ใหม่) นี้มีอยู่ในระบบแล้ว' }
      }
    }

    await prisma.contestant.update({
      where: { id: originalId },
      data: parsed.data
    })

    revalidatePath('/admin/contestants')
    revalidatePath('/results')
  } catch (error) {
    console.error('Update error:', error)
    return { error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' }
  }

  redirect('/admin/contestants')
}

export async function deleteContestantAction(formData: FormData) {
  const session = await getAdminSession()
  if (!session) throw new Error('Unauthorized')

  const id = formData.get('id') as string
  if (!id) throw new Error('Missing ID')

  try {
    // Delete associated votes first (cascade alternative)
    await prisma.vote.deleteMany({
      where: { contestantId: id }
    })
    
    await prisma.contestant.delete({
      where: { id }
    })
    
    revalidatePath('/admin/contestants')
    revalidatePath('/results')
  } catch (error) {
    console.error('Delete error:', error)
    throw new Error('Failed to delete contestant')
  }
}
