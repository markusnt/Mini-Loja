import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

type PageHeaderProps = {
  title: string
  description: string
  actionLabel: string
  onAction?: () => void
}

export function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <Button onClick={onAction}>
        <Plus className="size-4" data-icon="inline-start" />
        {actionLabel}
      </Button>
    </div>
  )
}
