'use client'

import { useActionState, useEffect, Suspense, useRef } from 'react'
import { verifyOtpAction } from '@/app/actions/auth'
import { KeyRound, CheckCircle2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyOTPForm() {
  const [state, formAction, isPending] = useActionState(verifyOtpAction, null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const contactMethod = searchParams.get('contactMethod') || (searchParams.get('phoneNumber') ? 'sms' : '')
  const contactValue = searchParams.get('contactValue') || searchParams.get('phoneNumber') || ''
  const eventId = searchParams.get('eventId') || ''
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!contactValue) {
      router.push(`/vote/register?eventId=${eventId}`)
    }
  }, [contactValue, eventId, router])

  useEffect(() => {
    if (state?.success && state.redirectUrl) {
      router.push(state.redirectUrl)
    }
  }, [state, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
      <div className="glass-card p-6 sm:p-10 md:p-12 rounded-3xl w-full max-w-md space-y-6 sm:space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] -ml-32 -mb-32 animate-pulse" style={{ animationDuration: '5s' }}></div>
        
        <div className="text-center relative z-10">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            ยืนยันรหัส OTP
          </h1>
          <p className="mt-2 text-xs sm:text-sm opacity-70">
            รหัส 6 หลักถูกส่งไปยัง{contactMethod === 'sms' ? 'เบอร์โทรศัพท์' : 'อีเมล'}<br/>
            <span className="font-mono text-base sm:text-lg font-bold text-primary mt-1 block">{contactValue}</span>
          </p>
        </div>

        <form action={formAction} className="space-y-6 relative z-10">
          <input type="hidden" name="contactMethod" value={contactMethod} />
          <input type="hidden" name="contactValue" value={contactValue} />
          <input type="hidden" name="eventId" value={eventId} />
          
          <div>
            <label htmlFor="otpCode" className="block text-sm font-medium opacity-90 mb-2 text-center">
              รหัสอ้างอิง OTP 6 หลัก
            </label>
            <input
              ref={inputRef}
              type="text"
              id="otpCode"
              name="otpCode"
              placeholder="000000"
              required
              pattern="[0-9]{6}"
              maxLength={6}
              className="glass-input w-full px-4 py-3 sm:py-4 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all text-2xl sm:text-3xl tracking-[0.5em] sm:tracking-[1em] text-center font-mono placeholder:opacity-30 font-bold"
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
            className="btn-primary w-full py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
          >
            {isPending ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                ยืนยัน OTP <CheckCircle2 className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
          
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => router.push(`/vote/register?eventId=${eventId}`)}
              className="text-sm opacity-60 hover:opacity-100 hover:text-primary transition-colors"
            >
              เปลี่ยนช่องทางการติดต่อ หรือขอ OTP ใหม่
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
