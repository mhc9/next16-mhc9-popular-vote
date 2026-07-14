'use client'

import { useState } from 'react'
import { Send, CheckCircle, HeartHandshake } from 'lucide-react'

type Contestant = {
  id: string
  fullName: string
  position: string
  department: string
  projectTitle: string
  projectDesc: string
  photoUrl: string
}

export default function CastVoteForm({
  eventId,
  contestants,
  token
}: {
  eventId: string
  contestants: Contestant[]
  token: string
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId || isPending) return

    setIsPending(true)
    setError(null)

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ eventId, contestantId: selectedId })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'เกิดข้อผิดพลาดในการบันทึกผลโหวต')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      console.error(err)
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsPending(false)
    }
  }

  if (success) {
    return (
      <div className="glass-card p-10 sm:p-16 rounded-[2.5rem] text-center space-y-6 border-green-500/30 !bg-green-500/5 max-w-2xl mx-auto shadow-[0_0_80px_-15px_rgba(34,197,94,0.3)] backdrop-blur-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        <div className="relative">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-white shadow-[0_0_40px_rgba(34,197,94,0.5)] border-4 border-green-400/30">
            <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 animate-[bounce_2s_infinite]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-4">
            VOTE CONFIRMED
          </h2>
          <p className="opacity-80 text-lg sm:text-xl flex flex-col items-center justify-center gap-3 font-medium">
            ระบบได้รับการโหวตของคุณเรียบร้อยแล้ว
            <span className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 rounded-full text-green-500 text-sm font-bold border border-green-500/20">
              <HeartHandshake className="w-4 h-4" /> Thank You
            </span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 relative">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="contestantId" value={selectedId || ''} />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] text-red-500 rounded-2xl text-center font-bold max-w-2xl mx-auto flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
          {error}
        </div>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 relative z-10">
        {contestants.map((c) => {
          const isSelected = selectedId === c.id
          return (
            <div
              key={c.id}
              className={`relative transition-all duration-500 h-full ${isPending ? 'pointer-events-none opacity-70 grayscale-[30%]' : ''
                } ${isSelected ? 'scale-[1.03] z-20' : 'hover:scale-[1.01] hover:z-10'}`}
            >
              {/* Selected Indicator Badge (Moved outside overflow-hidden) */}
              {isSelected && (
                <div className="absolute -top-3 -right-3 z-30 pointer-events-none">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary rounded-full blur-md animate-pulse"></div>
                    <div className="bg-gradient-to-tr from-primary to-secondary text-white w-12 h-12 rounded-full flex items-center justify-center font-black shadow-xl border-2 border-white/20 transform rotate-12 relative z-10">
                      ✓
                    </div>
                  </div>
                </div>
              )}

              <div
                onClick={() => !isPending && setSelectedId(c.id)}
                className="group relative rounded-[2rem] cursor-pointer overflow-hidden h-full block"
              >
                {/* Animated Glowing Border Background */}
                <div className={`absolute inset-0 rounded-[2rem] transition-all duration-500 ${isSelected
                  ? 'bg-gradient-to-r from-primary via-secondary to-primary animate-[spin_4s_linear_infinite] opacity-100'
                  : 'bg-gradient-to-br from-foreground/10 to-transparent dark:from-white/10 dark:to-transparent opacity-100 group-hover:from-primary/50 group-hover:to-secondary/50'
                  }`}></div>

                {/* Inner Card Content */}
                <div className={`relative z-10 m-[2px] rounded-[calc(2rem-2px)] backdrop-blur-2xl transition-all duration-500 h-[calc(100%-4px)] border ${isSelected
                  ? 'bg-background/90 shadow-[inset_0_0_60px_rgba(14,165,233,0.15)] border-transparent'
                  : 'bg-card-bg shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20'
                  }`}>
                  <div className="p-6 sm:p-8 h-full flex flex-col justify-between relative z-10">
                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                      <div className="relative w-28 h-28 mx-auto sm:mx-0 shrink-0">
                        {/* Avatar glow */}
                        <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${isSelected ? 'bg-primary/50' : 'bg-transparent group-hover:bg-white/20'
                          }`}></div>
                        <div className={`w-full h-full rounded-full overflow-hidden relative z-10 border-4 transition-all duration-500 ${isSelected ? 'border-primary shadow-[0_0_30px_rgba(14,165,233,0.4)]' : 'border-white/10'
                          }`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={c.photoUrl} alt={c.fullName} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      </div>

                      <div className="flex-1 text-center sm:text-left flex flex-col">
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                          <div className={`px-2 py-1 rounded-full text-sm font-black tracking-widest uppercase transition-colors duration-300 ${isSelected ? 'bg-primary text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 'bg-foreground/10 text-foreground/70'
                            }`}>
                            {c.id}
                          </div>
                        </div>
                        <h3 className={`text-xl sm:text-2xl font-black mb-1 transition-colors duration-300 ${isSelected ? 'text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary' : 'text-foreground'
                          }`}>
                          {c.projectTitle}
                        </h3>
                        <p className="text-sm font-bold opacity-90">{c.fullName}</p>
                        <p className="text-xs font-medium opacity-60 uppercase tracking-wider mt-1">{c.department}</p>
                        <p className="mt-4 text-sm opacity-80 leading-relaxed flex-1">
                          {c.projectDesc}
                        </p>
                      </div>
                    </div>

                    {/* Cyber Footer */}
                    <div className={`mt-6 pt-5 border-t transition-colors duration-300 flex justify-between items-center ${isSelected ? 'border-primary/30' : 'border-white/10'
                      }`}>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-[0.2em] opacity-50 font-bold mb-1">Status</span>
                        <span className={`text-sm font-black uppercase tracking-wider ${isSelected ? 'text-primary' : 'opacity-60'
                          }`}>
                          {isSelected ? 'SELECTED / READY' : 'STANDBY'}
                        </span>
                      </div>

                      <div className="relative">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isSelected
                          ? 'border-primary bg-primary/20 shadow-[0_0_20px_rgba(14,165,233,0.5)]'
                          : 'border-foreground/30 bg-transparent'
                          }`}>
                          <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isSelected ? 'bg-primary shadow-[0_0_10px_rgba(14,165,233,0.8)] scale-100' : 'bg-transparent scale-0'
                            }`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 glass-card border-t border-white/10 rounded-t-[2.5rem] z-50 flex justify-center backdrop-blur-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        <div className="w-full max-w-2xl relative">
          {/* Animated glow behind button */}
          {selectedId && !isPending && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-xl opacity-30 rounded-2xl animate-pulse"></div>
          )}

          <button
            type="submit"
            disabled={!selectedId || isPending}
            className={`w-full py-5 rounded-2xl font-black text-lg sm:text-xl tracking-wider uppercase transition-all duration-500 flex justify-center items-center gap-3 relative z-10 ${!selectedId
              ? 'bg-foreground/10 text-foreground/40 border border-foreground/10 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] hover:animate-[gradient_2s_linear_infinite] border border-white/20 active:scale-95'
              }`}
          >
            {isPending ? (
              <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : null}
            {isPending
              ? 'PROCESSING...'
              : selectedId
                ? (
                  <>
                    CONFIRM VOTE <Send className="w-5 h-5 ml-1 animate-pulse" />
                  </>
                )
                : 'SELECT YOUR CANDIDATE'
            }
          </button>
        </div>
      </div>
    </form>
  )
}
