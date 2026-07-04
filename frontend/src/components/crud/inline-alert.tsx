import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type InlineAlertProps = {
  message: string
  variant?: 'error' | 'success'
  onDismiss?: () => void
  className?: string
}

export function InlineAlert({
  message,
  variant = 'error',
  onDismiss,
  className,
}: InlineAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm',
        variant === 'error' &&
          'border-destructive/30 bg-destructive/10 text-destructive',
        variant === 'success' &&
          'border-primary/30 bg-primary/10 text-primary',
        className,
      )}
    >
      <p>{message}</p>
      {onDismiss ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onDismiss}
          aria-label="Fechar aviso"
          className="shrink-0"
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  )
}
