import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { deleteContestantAction } from '@/app/actions/admin-contestants'
import Image from 'next/image'

export default async function AdminContestantsPage() {
  const contestants = await prisma.contestant.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/30 dark:bg-black/20 p-6 rounded-3xl backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              จัดการผู้เข้าแข่งขัน
            </h1>
            <p className="text-foreground/60 text-sm mt-0.5">ระบบจัดการข้อมูลผู้เข้าร่วมประกวดทั้งหมด</p>
          </div>
        </div>
        <Link
          href="/admin/contestants/new"
          className="btn-primary px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-primary/30"
        >
          <Plus className="w-5 h-5" />
          เพิ่มผู้เข้าแข่งขัน
        </Link>
      </div>

      {/* Table Section */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-foreground/10 relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/5 text-foreground/80 border-b border-foreground/10 text-sm">
                <th className="p-5 font-semibold w-20">รูป</th>
                <th className="p-5 font-semibold w-24">รหัส</th>
                <th className="p-5 font-semibold min-w-[200px]">ชื่อ-สกุล</th>
                <th className="p-5 font-semibold min-w-[250px]">ผลงาน</th>
                <th className="p-5 font-semibold text-center w-28">คะแนนโหวต</th>
                <th className="p-5 font-semibold text-center w-32">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {contestants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center opacity-60">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-12 h-12 text-foreground/20" />
                      <p>ไม่พบข้อมูลผู้เข้าแข่งขัน</p>
                    </div>
                  </td>
                </tr>
              ) : (
                contestants.map((c) => (
                  <tr key={c.id} className="group hover:bg-primary/5 transition-all duration-300">
                    <td className="p-5">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-primary/10 border border-primary/20 relative shadow-sm group-hover:scale-105 transition-transform duration-300">
                        {/* <Image
                          src={c.photoUrl}
                          alt={c.fullName}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${c.fullName}`
                          }}
                        /> */}
                      </div>
                    </td>
                    <td className="p-5 font-mono text-sm font-bold text-foreground/70">{c.id}</td>
                    <td className="p-5">
                      <div className="font-bold text-foreground">{c.fullName}</div>
                      <div className="text-xs text-foreground/60 mt-1 inline-block px-2 py-0.5 bg-foreground/5 rounded-md">{c.department}</div>
                    </td>
                    <td className="p-5">
                      <div className="font-semibold text-sm line-clamp-1">{c.projectTitle}</div>
                      <div className="text-xs text-foreground/50 mt-1 line-clamp-1">{c.projectDesc}</div>
                    </td>
                    <td className="p-5 text-center">
                      <div className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded-xl bg-primary/10 text-primary font-bold">
                        {c.voteCount}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/contestants/${c.id}/edit`}
                          className="p-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm"
                          title="แก้ไข"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>

                        {/* <form action={deleteContestantAction} onSubmit={(e) => {
                          if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้? (การโหวตทั้งหมดของผู้เข้าแข่งขันนี้จะถูกลบด้วย)')) {
                            e.preventDefault()
                          }
                        }}>
                          <input type="hidden" name="id" value={c.id} />
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
