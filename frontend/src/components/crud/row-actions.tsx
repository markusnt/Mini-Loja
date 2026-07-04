import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'

type RowActionsProps = {
  onEdit?: () => void
  onDelete?: () => void
  deleteDisabled?: boolean
  deleteTooltip?: string
}

export function RowActions({
  onEdit,
  onDelete,
  deleteDisabled = false,
  deleteTooltip,
}: RowActionsProps) {
  const deleteButton = (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onDelete}
      disabled={deleteDisabled}
      aria-label={deleteDisabled ? deleteTooltip : 'Excluir'}
    >
      <Trash2 className="size-4" />
    </Button>
  )

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Editar">
        <Pencil className="size-4" />
      </Button>

      {deleteTooltip ? (
        <Tooltip content={deleteTooltip} align="end">
          <span className="inline-flex">{deleteButton}</span>
        </Tooltip>
      ) : (
        deleteButton
      )}
    </div>
  )
}
