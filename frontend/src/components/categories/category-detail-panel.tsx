import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

import { InlineAlert } from '@/components/crud/inline-alert'
import { ErrorState, LoadingState } from '@/components/crud/status-message'
import { CategoryFormSheet } from '@/components/categories/category-form-sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tooltip } from '@/components/ui/tooltip'
import { useCategory } from '@/hooks/use-category'
import {
  getCategoryDeleteBlockReason,
  isCategoryDeleteBlocked,
} from '@/lib/category-rules'
import { HttpError } from '@/services/api-client'

type CategoryDetailPanelProps = {
  categoryId: number | null
  open: boolean
  onClose: () => void
  onMutated?: () => void
  onActionError?: (message: string) => void
}

export function CategoryDetailPanel({
  categoryId,
  open,
  onClose,
  onMutated,
  onActionError,
}: CategoryDetailPanelProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const { category, isLoading, error, removeCategory, updateCategory } =
    useCategory(open ? categoryId : null)

  const productCount = category?._count?.products ?? 0
  const deleteBlocked = category ? isCategoryDeleteBlocked(category) : false
  const deleteTooltip = getCategoryDeleteBlockReason(productCount)

  const handleDelete = async () => {
    if (!category || deleteBlocked) {
      return
    }

    const confirmed = window.confirm(
      `Deseja excluir a categoria "${category.name}"?`,
    )

    if (!confirmed) {
      return
    }

    setLocalError(null)

    try {
      await removeCategory()
      onMutated?.()
      onClose()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao excluir categoria.'
      setLocalError(message)
      onActionError?.(message)
    }
  }

  const handleUpdate = async (name: string) => {
    await updateCategory({ name })
    onMutated?.()
  }

  const deleteButton = (
    <Button
      variant="destructive"
      onClick={() => void handleDelete()}
      disabled={deleteBlocked}
    >
      <Trash2 className="size-4" data-icon="inline-start" />
      Excluir
    </Button>
  )

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setLocalError(null)
            onClose()
          }
        }}
      >
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{category?.name ?? 'Detalhes da categoria'}</SheetTitle>
            <SheetDescription>
              Informações completas da categoria.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-4">
            {localError ? (
              <InlineAlert
                message={localError}
                onDismiss={() => setLocalError(null)}
              />
            ) : null}

            {isLoading ? (
              <LoadingState message="Carregando categoria..." />
            ) : error ? (
              <ErrorState message={error} />
            ) : category ? (
              <dl className="space-y-4">
                <div>
                  <dt className="text-muted-foreground text-sm">ID</dt>
                  <dd>{category.id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-sm">Nome</dt>
                  <dd className="font-medium">{category.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-sm">
                    Produtos vinculados
                  </dt>
                  <dd>
                    <Badge variant="secondary">{productCount}</Badge>
                  </dd>
                </div>
              </dl>
            ) : (
              <ErrorState message="Categoria não encontrada." />
            )}
          </div>

          {category ? (
            <SheetFooter className="flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" data-icon="inline-start" />
                Editar
              </Button>

              {deleteTooltip ? (
                <Tooltip content={deleteTooltip} align="end">
                  <span className="inline-flex">{deleteButton}</span>
                </Tooltip>
              ) : (
                deleteButton
              )}
            </SheetFooter>
          ) : null}
        </SheetContent>
      </Sheet>

      <CategoryFormSheet
        open={editOpen}
        category={category}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
      />
    </>
  )
}

export function parseCategoryDeleteError(err: unknown): string {
  if (err instanceof HttpError && err.status === 409) {
    return err.message
  }

  return err instanceof Error ? err.message : 'Erro ao excluir categoria.'
}
