'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, LayoutDashboard, LogOut, Shield, ChevronRight, Target } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { logoutAdminAction } from '@/app/actions/admin-auth'

const navigation = [
  { name: 'ภาพรวม (Dashboard)', href: '/admin', icon: LayoutDashboard },
  { name: 'กิจกรรม', href: '/admin/events', icon: Target },
  { name: 'ผู้เข้าแข่งขัน', href: '/admin/contestants', icon: Users },
]

export function AdminSidebar({ username }: { username: string }) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-72 flex-col h-screen sticky top-0 bg-white/40 dark:bg-black/20 backdrop-blur-2xl border-r border-white/20 dark:border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30">

      {/* Brand / Logo Area */}
      <div className="p-8">
        <Link href="/admin" className="flex items-center gap-3 group">
          <BrandLogo size={40} />
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              MHC9 Admin
            </h1>
            <p className="text-xs font-medium text-foreground/50 tracking-wider">MANAGEMENT SYSTEM</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300
                ${isActive
                  ? 'bg-white/60 dark:bg-white/10 shadow-sm border border-white/40 dark:border-white/10 text-primary'
                  : 'text-foreground/70 hover:bg-white/40 dark:hover:bg-white/5 hover:text-foreground hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-center gap-3.5">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300
                  ${isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-foreground/5 text-foreground/60 group-hover:bg-foreground/10 group-hover:text-foreground'
                  }
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`font-semibold ${isActive ? 'text-primary' : ''}`}>
                  {item.name}
                </span>
              </div>

              {isActive && (
                <ChevronRight className="w-4 h-4 text-primary animate-in fade-in slide-in-from-left-2" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 mt-auto">
        <div className="bg-white/50 dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-3xl p-2 shadow-sm">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center border border-white/50 dark:border-white/10">
              <span className="text-sm font-bold text-primary">
                {username.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{username}</p>
              <p className="text-xs text-foreground/50 truncate">Administrator</p>
            </div>
          </div>

          <div className="h-px w-full bg-border/50 my-2"></div>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="group flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
