import { prisma } from '@/lib/prisma'
import { Users, Vote, Target, TrendingUp } from 'lucide-react'

export default async function AdminDashboardPage() {
  const [totalContestants, totalVotes, totalEvents] = await Promise.all([
    prisma.contestant.count(),
    prisma.vote.count(),
    prisma.voteEvent.count(),
  ])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            ภาพรวมระบบ (Dashboard)
          </h1>
          <p className="text-foreground/60 mt-1">สรุปข้อมูลสถิติที่สำคัญของระบบโหวตในขณะนี้</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
          <div className="relative flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 text-primary rounded-2xl border border-primary/20 shadow-inner">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-foreground/60 font-medium mb-1">ผู้เข้าแข่งขันทั้งหมด</p>
              <p className="text-4xl font-black">{totalContestants}</p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all"></div>
          <div className="relative flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-secondary/20 to-secondary/5 text-secondary rounded-2xl border border-secondary/20 shadow-inner">
              <Vote className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-foreground/60 font-medium mb-1">จำนวนโหวตทั้งหมด</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black">{totalVotes}</p>
                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Live
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
          <div className="relative flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-500/5 text-green-500 rounded-2xl border border-green-500/20 shadow-inner">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-foreground/60 font-medium mb-1">กิจกรรมทั้งหมด</p>
              <p className="text-4xl font-black">{totalEvents}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass-card p-8 rounded-3xl mt-8 relative overflow-hidden border border-primary/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          👋 ยินดีต้อนรับสู่ระบบจัดการ (Management System)
        </h2>
        <p className="text-foreground/70 leading-relaxed max-w-3xl text-lg">
          คุณสามารถจัดการข้อมูลผู้เข้าแข่งขัน เพิ่ม หรือลบ ข้อมูลได้ที่เมนู <strong className="text-primary font-semibold">"ผู้เข้าแข่งขัน"</strong> ด้านซ้ายมือ 
          ข้อมูลทั้งหมดจะถูกซิงค์กับระบบหน้าบ้านแบบเรียลไทม์
        </p>
      </div>
    </div>
  )
}
