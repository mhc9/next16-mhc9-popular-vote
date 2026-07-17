import { Trophy } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const revalidate = 15 // Revalidate every 15 seconds (ISR / Polling effect)

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const resolvedParams = await searchParams
  const page = parseInt(resolvedParams.page || '1', 10) || 1
  const pageSize = 10

  const totalCount = await prisma.contestant.count({
    where: { isActive: true }
  })
  
  const totalPages = Math.ceil(totalCount / pageSize)

  const topContestants = await prisma.contestant.findMany({
    orderBy: { voteCount: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    where: { isActive: true }
  })

  const maxVotes = topContestants.length > 0 ? Math.max(topContestants[0].voteCount, 1) : 1

  return (
    <main className="min-h-screen w-full p-4 pt-20 sm:p-6 sm:pt-8 pb-24 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <header className="py-4 sm:py-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
          ผลการโหวตทั้งหมด
        </h1>
        <p className="mt-2 opacity-80 text-base sm:text-lg">อัปเดตคะแนนล่าสุดแบบเรียลไทม์</p>
      </header>

      <div className="glass-card p-4 sm:p-6 md:p-10 rounded-2xl sm:rounded-3xl space-y-6 sm:space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] -ml-32 -mb-32 animate-pulse" style={{ animationDuration: '5s' }}></div>
        
        {topContestants.length === 0 ? (
          <div className="text-center py-12 opacity-60 relative z-10">
            ยังไม่มีข้อมูลผู้เข้าแข่งขัน
          </div>
        ) : (
          <div className="space-y-8 relative z-10">
            {topContestants.map((c, index) => {
              const rank = (page - 1) * pageSize + index + 1
              const width = Math.max(1, (c.voteCount / maxVotes) * 100)
              
              return (
                <div key={c.id} className="flex items-center gap-3 sm:gap-4 group">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full font-bold text-lg sm:text-xl shrink-0 ${
                    rank === 1 ? 'bg-yellow-400 text-yellow-900 shadow-[0_0_15px_rgba(250,204,21,0.5)]' :
                    rank === 2 ? 'bg-gray-300 text-gray-800' :
                    rank === 3 ? 'bg-amber-600 text-amber-100' :
                    'bg-black/5 dark:bg-white/10 dark:text-white/80'
                  }`}>
                    {rank}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex justify-between items-end gap-2">
                      <h3 className="font-bold text-lg md:text-xl group-hover:text-primary transition-colors truncate">
                        {c.fullName}
                      </h3>
                      <div className="font-mono font-bold text-xl md:text-2xl text-primary shrink-0">
                        {c.voteCount} <span className="text-sm opacity-60 font-sans">โหวต</span>
                      </div>
                    </div>
                    
                    <div className="h-4 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          rank === 1 ? 'bg-gradient-to-r from-yellow-500 to-yellow-300' : 'bg-gradient-to-r from-primary to-secondary'
                        }`}
                        style={{ width: `${width}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between text-xs opacity-60 gap-1 sm:gap-4">
                      <p className="truncate sm:max-w-[70%] text-foreground/80">{c.projectTitle}</p>
                      <p className="truncate sm:text-right shrink-0">{c.department}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6 mt-8 border-t border-white/10 relative z-10">
            {page > 1 ? (
              <Link
                href={`/results?page=${page - 1}`}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 transition-all font-medium text-sm sm:text-base"
              >
                ย้อนกลับ
              </Link>
            ) : (
              <button disabled className="px-4 py-2 rounded-xl bg-transparent border border-transparent text-foreground/30 font-medium text-sm sm:text-base cursor-not-allowed">
                ย้อนกลับ
              </button>
            )}
            
            <div className="px-4 py-2 font-mono font-bold opacity-70">
              {page} / {totalPages}
            </div>

            {page < totalPages ? (
              <Link
                href={`/results?page=${page + 1}`}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 transition-all font-medium text-sm sm:text-base"
              >
                ถัดไป
              </Link>
            ) : (
              <button disabled className="px-4 py-2 rounded-xl bg-transparent border border-transparent text-foreground/30 font-medium text-sm sm:text-base cursor-not-allowed">
                ถัดไป
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
