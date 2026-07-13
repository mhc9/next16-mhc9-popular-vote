import { Suspense } from 'react'
import VerifyOTPForm from './VerifyOTPForm'

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyOTPForm />
    </Suspense>
  )
}
