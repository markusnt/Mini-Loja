import { NavLink } from 'react-router-dom'
import { Package, Tags } from 'lucide-react'

import { cn } from '@/lib/utils'

const links = [
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/categorias', label: 'Categorias', icon: Tags },
] as const

export function SidebarNav() {
  return (
    <aside className="bg-card flex w-56 shrink-0 flex-col border-r">
      <div className="border-b px-5 py-4">
        <p className="text-lg font-semibold tracking-tight">Mini Loja</p>
        <p className="text-muted-foreground text-xs">Painel administrativo</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
