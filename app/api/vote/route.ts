import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function POST(request: Request) {
  try {
    console.log('[API POST] Headers:', Object.fromEntries(request.headers.entries()))
    
    // First try Authorization header (Bearer token passed explicitly)
    const authHeader = request.headers.get('authorization')
    let session = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { decrypt } = await import('@/lib/session')
      session = await decrypt(token)
    } 
    
    // Fallback to standard cookie reading
    if (!session) {
      session = await getSession()
    }

    if (!session) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนโหวต' }, { status: 401 })
    }

    const { eventId, contestantId } = await request.json()

    if (!eventId || !contestantId) {
      return NextResponse.json({ error: 'ข้อมูลการโหวตไม่ครบถ้วน' }, { status: 400 })
    }

    const event = await prisma.voteEvent.findUnique({
      where: { id: eventId }
    })

    if (!event || !event.isOpen) {
      return NextResponse.json({ error: 'กิจกรรมนี้ปิดรับการโหวตแล้ว' }, { status: 403 })
    }

    if (new Date() < event.startAt || new Date() > event.endAt) {
      return NextResponse.json({ error: 'ไม่อยู่ในช่วงเวลาการโหวต' }, { status: 403 })
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
      return NextResponse.json({ error: 'คุณได้ทำการโหวตในกิจกรรมนี้ไปแล้ว (1 คน โหวตได้ 1 ครั้ง)' }, { status: 409 })
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

    return NextResponse.json({ success: true, message: 'บันทึกผลโหวตสำเร็จ ขอบคุณที่ร่วมสนุกครับ!' })
  } catch (error) {
    console.error('Cast Vote Error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกผลโหวต' }, { status: 500 })
  }
}
