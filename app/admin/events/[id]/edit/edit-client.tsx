'use client'

import { useActionState } from 'react'
import { updateEventAction } from '@/app/actions/admin-events'
import Link from 'next/link'
import { Save } from 'lucide-react'
import { VoteEvent } from '@prisma/client'

export default function EditEventClient({ event }: { event: VoteEvent }) {
  const [state, formAction, isPending] = useActionState(updateEventAction, null)

  // Format dates for datetime-local input
  const formatForInput = (date: Date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl shadow-sm border border-border/20">
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="id" value={event.id} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium opacity-90 mb-1.5">ชื่อกิจกรรม</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              defaultValue={event.name}
              required 
              className="glass-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all" 
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="qrToken" className="block text-sm font-medium opacity-90 mb-1.5">QR Token (สำหรับลิงก์โหวต)</label>
            <input 
              type="text" 
              id="qrToken" 
              name="qrToken" 
              defaultValue={event.qrToken}
              required 
              className="glass-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all" 
            />
          </div>

          <div>
            <label htmlFor="startAt" className="block text-sm font-medium opacity-90 mb-1.5">เวลาเริ่มต้นโหวต</label>
            <input 
              type="datetime-local" 
              id="startAt" 
              name="startAt" 
              defaultValue={formatForInput(event.startAt)}
              required 
              className="glass-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all" 
            />
          </div>

          <div>
            <label htmlFor="endAt" className="block text-sm font-medium opacity-90 mb-1.5">เวลาสิ้นสุดโหวต</label>
            <input 
              type="datetime-local" 
              id="endAt" 
              name="endAt" 
              defaultValue={formatForInput(event.endAt)}
              required 
              className="glass-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all" 
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="isOpen"
                  name="isOpen"
                  type="checkbox"
                  defaultChecked={event.isOpen}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="isOpen" className="font-bold text-foreground cursor-pointer">
                  เปิดใช้งานกิจกรรมนี้ทันที
                </label>
                <p className="text-foreground/60 text-xs">หากนำติ๊กออก ผู้ใช้จะไม่สามารถโหวตในกิจกรรมนี้ได้แม้จะอยู่ในช่วงเวลาที่กำหนด</p>
              </div>
            </div>
          </div>
          
        </div>

        {state?.error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            {state.error}
          </div>
        )}

        <div className="flex justify-end gap-4 pt-6 border-t border-border/20 mt-6">
          <Link 
            href="/admin/events"
            className="px-6 py-3 rounded-xl font-medium bg-foreground/5 hover:bg-foreground/10 transition-colors"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary !from-blue-500 !to-cyan-600 shadow-blue-500/30 px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
  )
}
