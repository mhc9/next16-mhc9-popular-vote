import { getAdminSession } from '@/lib/admin-session'
import { AdminSidebar } from './admin-sidebar'
import { AdminMobileHeader } from './admin-mobile-header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession()
  
  // Basic layout without sidebar if not logged in (e.g. login page)
  if (!session) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans selection:bg-primary/30">
      
      {/* Mobile Header (Client Component) */}
      <AdminMobileHeader username={session.username} />

      {/* Desktop Sidebar (Client Component) */}
      <AdminSidebar username={session.username} />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
    </div>
  )
}
