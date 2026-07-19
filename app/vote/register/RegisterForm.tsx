'use client'

import { useActionState, useEffect, Suspense, useState } from 'react'
import { requestOtpAction } from '@/app/actions/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { Phone, Send, Mail } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(requestOtpAction, null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [contactMethod, setContactMethod] = useState<'sms' | 'email'>('email')
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (state?.success && state.contactValue && state.contactMethod) {
      router.push(`/vote/verify-otp?contactMethod=${state.contactMethod}&contactValue=${state.contactValue}&eventId=${eventId}`)
    }
  }, [state, router, eventId])

  useEffect(() => {
    if (state?.retryAfter) {
      const targetTime = new Date(state.retryAfter).getTime()
      
      const updateCountdown = () => {
        const now = Date.now()
        const diff = Math.max(0, Math.floor((targetTime - now) / 1000))
        setCountdown(diff)
      }
      
      updateCountdown()
      const interval = setInterval(updateCountdown, 1000)
      
      return () => clearInterval(interval)
    } else {
      setCountdown(null)
    }
  }, [state?.retryAfter])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
      <div className="glass-card p-6 sm:p-10 md:p-12 rounded-3xl w-full max-w-md space-y-6 sm:space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] -ml-32 -mb-32 animate-pulse" style={{ animationDuration: '5s' }}></div>

        <div className="text-center relative z-10">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary transition-all duration-300">
            {contactMethod === 'sms' ? <Phone className="w-8 h-8" /> : <Mail className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            ลงทะเบียนโหวต
          </h1>
          <p className="mt-2 text-xs sm:text-sm opacity-70">
            {contactMethod === 'sms' ? 'กรอกเบอร์โทรศัพท์มือถือเพื่อรับรหัส OTP' : 'กรอกอีเมลเพื่อรับรหัส OTP'}
          </p>
        </div>

        <div className="flex p-1 bg-white/5 dark:bg-black/20 rounded-xl relative z-10 border border-white/10">
          <button
            type="button"
            onClick={() => setContactMethod('email')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${contactMethod === 'email' ? 'bg-primary text-black shadow-md' : 'opacity-60 hover:opacity-100'
              }`}
          >
            Email
          </button>
          <button
            type="button"
            disabled
            className="flex-1 py-2 text-sm font-medium rounded-lg transition-all opacity-30 cursor-not-allowed"
            title="ระบบลงทะเบียนด้วย SMS ปิดให้บริการชั่วคราว"
          >
            SMS
          </button>
        </div>

        <form action={formAction} className="space-y-6 relative z-10">
          <input type="hidden" name="captchaToken" value={captchaToken || ''} />
          <input type="hidden" name="contactMethod" value={contactMethod} />

          <div>
            <label htmlFor="contactValue" className="block text-sm font-medium opacity-90 mb-2">
              {contactMethod === 'sms' ? 'เบอร์โทรศัพท์' : 'อีเมล'}
            </label>
            <input
              type={contactMethod === 'sms' ? 'tel' : 'email'}
              id="contactValue"
              name="contactValue"
              placeholder={contactMethod === 'sms' ? '0812345678' : 'example@domain.com'}
              required
              pattern={contactMethod === 'sms' ? '^0[0-9]{9}$' : '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'}
              maxLength={contactMethod === 'sms' ? 10 : 100}
              className="glass-input w-full px-4 py-3 sm:py-3.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all text-base sm:text-lg tracking-wider font-mono placeholder:opacity-50"
            />
          </div>

          <div className="flex justify-center min-h-[65px]">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
              onSuccess={(token) => setCaptchaToken(token)}
              options={{ theme: 'dark' }}
            />
          </div>

          {state?.error && countdown !== 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center">
              {state.error}
              {countdown !== null && countdown > 0 && (
                <div className="mt-1.5 font-mono font-bold text-xl drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                  {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')} นาที
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !captchaToken || (countdown !== null && countdown > 0)}
            className="btn-primary w-full py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
          >
            {isPending ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                รับรหัส OTP <Send className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
