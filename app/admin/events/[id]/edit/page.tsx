import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import EditEventClient from './edit-client'

export default async function EditEventPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const event = await prisma.voteEvent.findUnique({
    where: { id }
  })

  if (!event) {
    redirect('/admin/events')
  }

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/events"
          className="p-2 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">
            แก้ไขกิจกรรมโหวต
          </h1>
          <p className="text-foreground/60 text-sm mt-0.5">รหัส: {event.id}</p>
        </div>
      </div>

      <EditEventClient event={event} />
    </div>
  )
}
