'use client'

import { useActionState } from 'react'
import { createContestantAction } from '@/app/actions/admin-contestants'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewContestantPage() {
  const [state, formAction, isPending] = useActionState(createContestantAction, null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/contestants"
          className="p-2 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">เพิ่มผู้เข้าแข่งขัน</h1>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl">
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="id" className="block text-sm font-medium opacity-90 mb-1.5">รหัสผู้เข้าแข่งขัน (ID)</label>
              <input type="text" id="id" name="id" required placeholder="เช่น MHC05" className="glass-input w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium opacity-90 mb-1.5">ชื่อ-นามสกุล</label>
              <input type="text" id="fullName" name="fullName" required className="glass-input w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium opacity-90 mb-1.5">ตำแหน่ง</label>
              <input type="text" id="position" name="position" required className="glass-input w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium opacity-90 mb-1.5">หน่วยงาน/แผนก</label>
              <input type="text" id="department" name="department" required className="glass-input w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="projectTitle" className="block text-sm font-medium opacity-90 mb-1.5">ชื่อผลงานนวัตกรรม</label>
              <input type="text" id="projectTitle" name="projectTitle" required className="glass-input w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="projectDesc" className="block text-sm font-medium opacity-90 mb-1.5">รายละเอียดผลงาน (ย่อ)</label>
              <textarea id="projectDesc" name="projectDesc" required rows={3} className="glass-input w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none resize-none"></textarea>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="photoUrl" className="block text-sm font-medium opacity-90 mb-1.5">URL รูปภาพ (เช่น https://...)</label>
              <input type="url" id="photoUrl" name="photoUrl" required placeholder="https://api.dicebear.com/7.x/avataaars/svg?seed=Test" className="glass-input w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
          </div>

          {state?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
              {state.error}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
            <Link 
              href="/admin/contestants"
              className="px-6 py-2.5 rounded-xl font-medium bg-foreground/5 hover:bg-foreground/10 transition-colors"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  บันทึกข้อมูล
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
