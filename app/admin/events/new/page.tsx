'use client'

import { useActionState } from 'react'
import { createEventAction } from '@/app/actions/admin-events'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewEventPage() {
  const [state, formAction, isPending] = useActionState(createEventAction, null)

  // Get current time formatted for datetime-local input
  const now = new Date()
  const defaultStart = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  
  const end = new Date(now)
  end.setDate(end.getDate() + 7)
  const defaultEnd = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

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
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600">
            เพิ่มกิจกรรมโหวต
          </h1>
          <p className="text-foreground/60 text-sm mt-0.5">สร้างกิจกรรมใหม่และกำหนดระยะเวลาการโหวต</p>
        </div>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl shadow-sm border border-border/20">
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium opacity-90 mb-1.5">ชื่อกิจกรรม</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                placeholder="เช่น การประกวดดาว-เดือน 2026" 
                className="glass-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:outline-none transition-all" 
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="qrToken" className="block text-sm font-medium opacity-90 mb-1.5">QR Token (สำหรับลิงก์โหวต)</label>
              <input 
                type="text" 
                id="qrToken" 
                name="qrToken" 
                required 
                placeholder="เช่น mhc9-popular" 
                className="glass-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:outline-none transition-all" 
              />
              <p className="text-xs text-foreground/50 mt-1.5">ใช้ภาษาอังกฤษ ตัวเลข และขีดกลาง (-) เท่านั้น ห้ามเว้นวรรค</p>
            </div>

            <div>
              <label htmlFor="startAt" className="block text-sm font-medium opacity-90 mb-1.5">เวลาเริ่มต้นโหวต</label>
              <input 
                type="datetime-local" 
                id="startAt" 
                name="startAt" 
                defaultValue={defaultStart}
                required 
                className="glass-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:outline-none transition-all" 
              />
            </div>

            <div>
              <label htmlFor="endAt" className="block text-sm font-medium opacity-90 mb-1.5">เวลาสิ้นสุดโหวต</label>
              <input 
                type="datetime-local" 
                id="endAt" 
                name="endAt" 
                defaultValue={defaultEnd}
                required 
                className="glass-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:outline-none transition-all" 
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    id="isOpen"
                    name="isOpen"
                    type="checkbox"
                    defaultChecked
                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-600 cursor-pointer"
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
              className="btn-primary !from-green-500 !to-emerald-600 shadow-green-500/30 px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
