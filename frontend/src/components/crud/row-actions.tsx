import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

type RowActionsProps = {
  onEdit?: () => void
  onDelete?: () => void
}

export function RowActions({ onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon-sm" onClick={onEdit}>
        <Pencil className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={onDelete}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}
