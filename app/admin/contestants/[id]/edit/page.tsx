import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EditContestantForm from './edit-form'

export default async function EditContestantPage({ params }: { params: { id: string } }) {
  const { id } = await params

  const contestant = await prisma.contestant.findUnique({
    where: { id }
  })

  if (!contestant) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <EditContestantForm contestant={contestant} />
    </div>
  )
}
