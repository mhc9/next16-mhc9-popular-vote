import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import CastVoteForm from './cast-vote-form'
import { Sparkles, CheckCircle, HeartHandshake } from 'lucide-react'

export default async function CastVotePage({
  searchParams
}: {
  searchParams: Promise<{ eventId?: string }>
}) {
  const session = await getSession()
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value || ''
  
  const resolvedParams = await searchParams
  const eventId = resolvedParams.eventId

  if (!session) {
    redirect(eventId ? `/vote/register?eventId=${eventId}` : '/vote/register')
  }

  if (!eventId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/10 via-background to-background"></div>
        <div className="glass-card p-10 rounded-[2rem] max-w-md text-center border-red-500/20 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)] relative z-10">
          <h1 className="text-3xl font-black text-red-500 mb-4 tracking-tight">SYSTEM ERROR</h1>
          <p className="text-foreground/70 font-medium">ไม่พบข้อมูลกิจกรรม กรุณาสแกน QR Code เข้างานใหม่อีกครั้ง</p>
        </div>
      </div>
    )
  }

  const event = await prisma.voteEvent.findUnique({
    where: { id: eventId }
  })

  if (!event || !event.isOpen) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-background to-background"></div>
        <div className="glass-card p-10 rounded-[2rem] max-w-md text-center border-orange-500/20 shadow-[0_0_50px_-12px_rgba(249,115,22,0.3)] relative z-10">
          <h1 className="text-3xl font-black text-orange-500 mb-4 tracking-tight">VOTING CLOSED</h1>
          <p className="text-foreground/70 font-medium">กิจกรรมนี้ยังไม่เปิดรับโหวต หรือหมดเวลาการโหวตไปแล้ว</p>
        </div>
      </div>
    )
  }

  const existingVote = await prisma.vote.findUnique({
    where: {
      voteEventId_voterId: {
        voteEventId: eventId,
        voterId: session.voterId
      }
    }
  })

  const contestants = await prisma.contestant.findMany({
    orderBy: { id: 'asc' }
  })

  return (
    <main className="min-h-screen p-4 pb-36 sm:p-6 sm:pb-40 max-w-6xl mx-auto space-y-8 sm:space-y-12 relative">

      {/* Futuristic Background Elements specific to this page */}
      <div className="fixed inset-0 pointer-events-none z-[-1] flex items-center justify-center opacity-30">
        <div className="w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen translate-y-[-20%]"></div>
        <div className="w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[100px] mix-blend-screen translate-y-[20%] translate-x-[20%]"></div>
      </div>

      <header className="pt-8 sm:pt-12 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-bold tracking-widest uppercase mb-6 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Live Voting System
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-primary to-secondary drop-shadow-sm mb-4 leading-tight pb-2">
          {event.name}
        </h1>

        <p className="mt-4 text-foreground/70 text-base sm:text-xl max-w-2xl mx-auto font-medium">
          เลือกผลงานสุดยอดนวัตกรรมที่คุณชื่นชอบที่สุด <br className="hidden sm:block" />
          <span className="text-primary font-bold">โหวตได้เพียง 1 สิทธิ์เท่านั้น</span>
        </p>

        <div className="mt-8 flex justify-center">
          <div className="glass-card px-6 py-2.5 rounded-2xl border-white/10 flex items-center gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xs font-bold text-white shadow-inner border border-white/20">
              {session.phoneNumber.substring(session.phoneNumber.length - 2)}
            </div>
            <div className="text-left">
              <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider">Voter ID</p>
              <p className="text-sm font-mono font-bold text-foreground/90">{session.phoneNumber}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        {existingVote ? (
          <div className="glass-card p-10 sm:p-16 rounded-[2.5rem] text-center space-y-6 border-green-500/30 !bg-green-500/5 max-w-2xl mx-auto shadow-[0_0_80px_-15px_rgba(34,197,94,0.3)] backdrop-blur-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-white shadow-[0_0_40px_rgba(34,197,94,0.5)] border-4 border-green-400/30">
                <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 animate-[bounce_2s_infinite]" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-4">
                VOTE CONFIRMED
              </h2>
              <p className="opacity-80 text-lg sm:text-xl flex flex-col items-center justify-center gap-3 font-medium">
                ระบบได้รับการโหวตของคุณเรียบร้อยแล้ว
                <span className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 rounded-full text-green-500 text-sm font-bold border border-green-500/20">
                  <HeartHandshake className="w-4 h-4" /> Thank You
                </span>
              </p>
            </div>
          </div>
        ) : (
          <CastVoteForm eventId={eventId} contestants={contestants} token={token} />
        )}
      </div>
    </main>
  )
}
