'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, LayoutDashboard, LogOut, Menu, X, Shield, Target } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { logoutAdminAction } from '@/app/actions/admin-auth'

const navigation = [
  { name: 'ภาพรวม (Dashboard)', href: '/admin', icon: LayoutDashboard },
  { name: 'ผู้เข้าแข่งขัน', href: '/admin/contestants', icon: Users },
  { name: 'กิจกรรม', href: '/admin/events', icon: Target },
]

export function AdminMobileHeader({ username }: { username: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 bg-white/70 dark:bg-black/40 backdrop-blur-xl border-b border-white/20 dark:border-white/10 sticky top-0 z-50 shadow-sm">
        <Link href="/admin" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <BrandLogo size={32} />
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            MHC9 Admin
          </span>
        </Link>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -mr-2 text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-md pt-[73px]">
          <div className="bg-white dark:bg-black h-full flex flex-col p-6 shadow-2xl">
            
            <div className="flex items-center gap-4 mb-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20">
                <span className="text-lg font-bold text-primary">
                  {username.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{username}</p>
                <p className="text-xs text-foreground/50">Administrator</p>
              </div>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-4 px-4 py-4 rounded-2xl transition-all
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-bold' 
                        : 'text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5 font-medium'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-foreground/50'}`} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-auto pt-6 border-t border-border">
              <form action={logoutAdminAction}>
                <button 
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  ออกจากระบบ
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
