import { Outlet } from 'react-router-dom'

import { SidebarNav } from '@/components/layout/sidebar-nav'

export function AppLayout() {
  return (
    <div className="bg-background flex min-h-svh">
      <SidebarNav />
      <main className="flex flex-1 flex-col overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
