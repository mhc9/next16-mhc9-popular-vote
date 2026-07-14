'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function castVoteAction(prevState: any, formData: FormData) {
  try {
    const session = await getSession()
    if (!session) {
      return { error: 'กรุณาเข้าสู่ระบบก่อนโหวต' }
    }

    const eventId = formData.get('eventId') as string
    const contestantId = formData.get('contestantId') as string

    if (!eventId || !contestantId) {
      return { error: 'ข้อมูลการโหวตไม่ครบถ้วน' }
    }

    const event = await prisma.voteEvent.findUnique({
      where: { id: eventId }
    })

    if (!event || !event.isOpen) {
      return { error: 'กิจกรรมนี้ปิดรับการโหวตแล้ว' }
    }

    if (new Date() < event.startAt || new Date() > event.endAt) {
      return { error: 'ไม่อยู่ในช่วงเวลาการโหวต' }
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        voteEventId_voterId: {
          voteEventId: eventId,
          voterId: session.voterId
        }
      }
    })

    if (existingVote) {
      return { error: 'คุณได้ทำการโหวตในกิจกรรมนี้ไปแล้ว (1 คน โหวตได้ 1 ครั้ง)' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.vote.create({
        data: {
          voteEventId: eventId,
          voterId: session.voterId,
          contestantId,
        }
      })

      await tx.contestant.update({
        where: { id: contestantId },
        data: { voteCount: { increment: 1 } }
      })
    })

    revalidatePath('/vote/cast')

    return { success: true, message: 'บันทึกผลโหวตสำเร็จ ขอบคุณที่ร่วมสนุกครับ!' }
  } catch (error) {
    console.error('Cast Vote Error:', error)
    return { error: 'เกิดข้อผิดพลาดในการบันทึกผลโหวต' }
  }
}
