import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type TooltipProps = {
  content: string
  children: ReactNode
  className?: string
  align?: 'center' | 'end'
}

export function Tooltip({
  content,
  children,
  className,
  align = 'center',
}: TooltipProps) {
  return (
    <span className={cn('group/tooltip relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'bg-foreground text-background pointer-events-none absolute bottom-full z-50 mb-2 max-w-56 rounded-md px-2.5 py-1.5 text-xs whitespace-normal opacity-0 shadow-md transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100',
          align === 'center' && 'left-1/2 -translate-x-1/2',
          align === 'end' && 'right-0',
        )}
      >
        {content}
      </span>
    </span>
  )
}
