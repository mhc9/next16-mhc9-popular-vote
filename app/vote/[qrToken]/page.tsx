import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function QRTokenEntryPage({ 
  params 
}: { 
  params: Promise<{ qrToken: string }> 
}) {
  const resolvedParams = await params
  
  const event = await prisma.voteEvent.findUnique({
    where: { qrToken: resolvedParams.qrToken }
  })

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-card p-8 rounded-2xl max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">ไม่พบกิจกรรม</h1>
          <p>QR Code ไม่ถูกต้อง หรือกิจกรรมนี้ถูกลบไปแล้ว</p>
        </div>
      </div>
    )
  }

  if (!event.isOpen || new Date() > event.endAt || new Date() < event.startAt) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-card p-8 rounded-2xl max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">กิจกรรมไม่เปิดรับโหวต</h1>
          <p>กิจกรรม "{event.name}" ยังไม่เปิด หรือปิดรับการโหวตแล้ว</p>
        </div>
      </div>
    )
  }

  const session = await getSession()
  
  if (!session) {
    redirect(`/vote/register?eventId=${event.id}`)
  } else {
    redirect(`/vote/cast?eventId=${event.id}`)
  }
}
