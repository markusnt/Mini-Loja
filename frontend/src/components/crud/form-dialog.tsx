import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type FormDialogProps = {
  open: boolean
  title: string
  description?: string
  submitLabel?: string
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: () => void
  children: ReactNode
}

export function FormDialog({
  open,
  title,
  description,
  submitLabel = 'Salvar',
  isSubmitting = false,
  onClose,
  onSubmit,
  children,
}: FormDialogProps) {
  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>

        <CardContent>{children}</CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : submitLabel}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
