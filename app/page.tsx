import Link from 'next/link'
import { Sparkles, Trophy, CalendarDays, ChevronRight, Inbox } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export default async function Home() {
  const events = await prisma.voteEvent.findMany({
    where: { isOpen: true },
    orderBy: { startAt: 'desc' }
  })

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="z-10 max-w-3xl w-full items-center justify-between font-sans">
        <div className="glass-card px-4 py-12 sm:p-10 md:p-12 rounded-3xl text-center relative overflow-hidden flex flex-col">
          {/* Decorative element */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/30 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '5s' }}></div>

          {/* HUD Elements */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col gap-1 z-20 pointer-events-none">
            <div className="text-[8px] sm:text-[10px] font-mono tracking-[0.3em] text-primary/70">SYS.INIT.OK</div>
            <div className="w-8 sm:w-12 h-[1px] bg-primary/30"></div>
          </div>
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col items-end gap-1 z-20 pointer-events-none">
            <div className="w-8 sm:w-12 h-[1px] bg-secondary/30"></div>
            <div className="text-[8px] sm:text-[10px] font-mono tracking-[0.3em] text-secondary/70 uppercase">MHC9_VOTE_v2.0</div>
          </div>

          {/* Corner Crosshairs */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-r-2 border-primary/40 pointer-events-none"></div>
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-l-2 border-primary/40 pointer-events-none"></div>

          <div className="space-y-6 sm:space-y-8 flex flex-col items-center relative z-10 w-full">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 mb-2 sm:mb-4 rounded-none border border-primary/30 bg-primary/5 text-primary text-[9px] sm:text-[10px] font-mono tracking-[0.2em] shadow-[0_0_15px_rgba(0,246,255,0.2)]">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
              NETWORK SECURE
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary pb-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 drop-shadow-[0_0_20px_rgba(0,246,255,0.4)] w-full">
              <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-primary animate-pulse drop-shadow-[0_0_10px_rgba(0,246,255,1)]" />
              MHC9 Popular Vote
            </h1>
            <p className="text-sm sm:text-lg md:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed px-2 mt-2 sm:mt-4">
              ร่วมโหวตและเป็นส่วนหนึ่งในการตัดสินสุดยอดผลงาน<br className="hidden sm:block" />
              นวัตกรรมสุขภาพจิต เขตสุขภาพที่ 9
            </p>

            <div className="mt-8 sm:mt-12 max-w-md mx-auto space-y-4 sm:space-y-6 relative z-10">
              <h2 className="text-xl font-bold font-mono tracking-widest text-foreground/90 dark:text-white/90 flex items-center justify-center gap-2 uppercase">
                <Trophy className="w-5 h-5 text-secondary drop-shadow-[0_0_10px_rgba(176,38,255,0.8)]" />
                Active Sessions
              </h2>
              {events.length === 0 ? (
                <div className="p-8 rounded-none bg-black/5 dark:bg-black/40 border border-primary/20 flex flex-col items-center gap-3 shadow-[inset_0_0_20px_rgba(14,165,233,0.05)] dark:shadow-[inset_0_0_20px_rgba(0,246,255,0.05)]">
                  <Inbox className="w-10 h-10 text-primary/40" />
                  <p className="font-mono text-sm text-primary/70 tracking-widest uppercase">No Active Sessions</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {events.map(event => (
                    <Link
                      href={`/vote/${event.qrToken}`}
                      key={event.id}
                      className="group flex items-center justify-between p-4 sm:p-5 rounded-none bg-white/60 dark:bg-black/60 border border-black/10 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(14,165,233,0.2)] dark:hover:shadow-[0_0_30px_rgba(0,246,255,0.2)] hover:bg-primary/5 active:scale-95 text-left relative overflow-hidden"
                    >
                      {/* Hover scanline */}
                      <div className="absolute inset-0 w-full h-[2px] bg-primary/50 blur-[2px] -translate-y-full group-hover:animate-[scanline_2s_linear_infinite]"></div>

                      <div className="relative z-10 w-full pr-2">
                        <div className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] text-primary/70 mb-1">EVENT_ID: {event.id.substring(event.id.length - 8).toUpperCase()}</div>
                        <h3 className="text-base sm:text-xl font-black text-foreground dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors leading-tight">{event.name}</h3>
                        <p className="text-[10px] sm:text-sm font-mono mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2 text-foreground/70 dark:text-white/60">
                          <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate">ปิดโหวตวันที่ {new Date(event.endAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </p>
                      </div>
                      <div className="w-10 h-10 border border-black/10 dark:border-white/20 bg-white/80 dark:bg-black flex items-center justify-center group-hover:border-primary dark:group-hover:border-primary group-hover:bg-primary/10 dark:group-hover:bg-primary/20 group-hover:text-primary transition-all shrink-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                        <ChevronRight className="w-5 h-5 text-foreground/50 dark:text-white/60 group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
