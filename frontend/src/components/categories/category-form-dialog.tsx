import { useEffect, useState } from 'react'

import { FormDialog } from '@/components/crud/form-dialog'
import { FormField } from '@/components/crud/form-field'
import { Input } from '@/components/ui/input'
import type { Category } from '@/types/catalog'

type CategoryFormDialogProps = {
  open: boolean
  category?: Category | null
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
}

export function CategoryFormDialog({
  open,
  category,
  onClose,
  onSubmit,
}: CategoryFormDialogProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = Boolean(category)

  useEffect(() => {
    if (open) {
      setName(category?.name ?? '')
      setError(null)
    }
  }, [open, category])

  const handleSubmit = async () => {
    const trimmedName = name.trim()

    if (trimmedName.length < 2) {
      setError('Informe um nome com pelo menos 2 caracteres.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit(trimmedName)
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar categoria.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormDialog
      open={open}
      title={isEditing ? 'Editar categoria' : 'Nova categoria'}
      description="Informe o nome da categoria."
      submitLabel={isEditing ? 'Atualizar' : 'Criar'}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
    >
      <FormField label="Nome" htmlFor="category-name" error={error ?? undefined}>
        <Input
          id="category-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex.: Eletrônicos"
          autoFocus
        />
      </FormField>
    </FormDialog>
  )
}
