'use client'

import { useActionState } from 'react'
import { loginAdminAction } from '@/app/actions/admin-auth'
import { ShieldCheck, ArrowRight } from 'lucide-react'

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdminAction, null)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-background">
      <div className="glass-card p-8 sm:p-12 md:p-14 rounded-3xl w-full max-w-md space-y-6 sm:space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] -ml-32 -mb-32 animate-pulse" style={{ animationDuration: '5s' }}></div>
        
        <div className="text-center relative z-10">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Admin Login
          </h1>
          <p className="mt-2 text-sm opacity-70">เข้าสู่ระบบการจัดการหลังบ้าน</p>
        </div>

        <form action={formAction} className="space-y-5 relative z-10">
          <div>
            <label htmlFor="username" className="block text-sm font-medium opacity-90 mb-1.5">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              className="glass-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium opacity-90 mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="glass-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            />
          </div>

          {state?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full py-3.5 mt-2 rounded-xl font-bold text-base shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
          >
            {isPending ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                เข้าสู่ระบบ <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
