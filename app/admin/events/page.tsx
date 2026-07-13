import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Target, Calendar, QrCode } from 'lucide-react'
import { deleteEventAction } from '@/app/actions/admin-events'

export default async function AdminEventsPage() {
  const events = await prisma.voteEvent.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/30 dark:bg-black/20 p-6 rounded-3xl backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600">
              จัดการกิจกรรมโหวต
            </h1>
            <p className="text-foreground/60 text-sm mt-0.5">ระบบจัดการข้อมูลกิจกรรมและการเปิด-ปิดระบบโหวต</p>
          </div>
        </div>
        <Link
          href="/admin/events/new"
          className="btn-primary !from-green-500 !to-emerald-600 px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-green-500/30 border-green-400/20"
        >
          <Plus className="w-5 h-5" />
          เพิ่มกิจกรรม
        </Link>
      </div>

      {/* Table Section */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-foreground/10 relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/5 text-foreground/80 border-b border-foreground/10 text-sm">
                <th className="p-5 font-semibold min-w-[200px]">ชื่อกิจกรรม</th>
                <th className="p-5 font-semibold min-w-[150px] w-[20%]">QR Token</th>
                <th className="p-5 font-semibold w-[20%] text-center">ระยะเวลา</th>
                <th className="p-5 font-semibold w-[10%] text-center">สถานะ</th>
                <th className="p-5 font-semibold text-center  w-[10%]">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center opacity-60">
                    <div className="flex flex-col items-center gap-3">
                      <Calendar className="w-12 h-12 text-foreground/20" />
                      <p>ไม่พบข้อมูลกิจกรรม</p>
                    </div>
                  </td>
                </tr>
              ) : (
                events.map((e) => {
                  const now = new Date()
                  const isOngoing = e.isOpen && e.startAt <= now && e.endAt >= now

                  return (
                    <tr key={e.id} className="group hover:bg-primary/5 transition-all duration-300">
                      <td className="p-5">
                        <div className="font-bold text-foreground text-lg">{e.name}</div>
                        <div className="text-xs text-foreground/50 mt-1">ID: {e.id}</div>
                      </td>
                      <td className="p-5 font-mono text-sm text-foreground/70">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-foreground/40" />
                          <span className="bg-foreground/5 px-2 py-1 rounded-md">{e.qrToken}</span>
                        </div>
                      </td>
                      <td className="p-5 text-sm text-center">
                        <div className="font-medium text-foreground/80">
                          {e.startAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-foreground/40 text-xs my-1">ถึง</div>
                        <div className="font-medium text-foreground/80">
                          {e.endAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        {isOngoing ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            เปิดโหวต
                          </div>
                        ) : e.isOpen && e.startAt > now ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">
                            รอเปิดโหวต
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-foreground/10 text-foreground/60 text-xs font-bold border border-foreground/10">
                            ปิดโหวตแล้ว
                          </div>
                        )}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/events/${e.id}/edit`}
                            className="p-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm"
                            title="แก้ไข"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>

                          {/* <form action={deleteEventAction} onSubmit={(ev) => {
                            if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้? (การโหวตทั้งหมดในกิจกรรมนี้จะถูกลบด้วย)')) {
                              ev.preventDefault()
                            }
                          }}>
                            <input type="hidden" name="id" value={e.id} />
                            <button
                              type="submit"
                              className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm"
                              title="ลบ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form> */}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
