import { useEffect, useState } from 'react'

import { FormSheet } from '@/components/crud/form-sheet'
import { FormField } from '@/components/crud/form-field'
import { Input } from '@/components/ui/input'
import { categoriesService } from '@/services/categories.service'
import {
  formatCurrencyInput,
  maskCurrencyInput,
  parseCurrencyInput,
} from '@/lib/formatters'
import type { Category, Product } from '@/types/catalog'

type ProductFormDialogProps = {
  open: boolean
  product?: Product | null
  onClose: () => void
  onSubmit: (data: {
    name: string
    description: string
    price: number
    categoryId: number
  }) => Promise<void>
}

export function ProductFormDialog({
  open,
  product,
  onClose,
  onSubmit,
}: ProductFormDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = Boolean(product)

  useEffect(() => {
    if (!open) {
      return
    }

    setName(product?.name ?? '')
    setDescription(product?.description ?? '')
    setPrice(product ? formatCurrencyInput(product.price) : '')
    setCategoryId(product ? String(product.categoryId) : '')
    setError(null)

    void categoriesService.list().then(setCategories).catch(() => {
      setCategories([])
    })
  }, [open, product])

  const handleSubmit = async () => {
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()
    const parsedPrice = parseCurrencyInput(price)
    const parsedCategoryId = Number(categoryId)

    if (trimmedName.length < 2) {
      setError('Informe um nome com pelo menos 2 caracteres.')
      return
    }

    if (!trimmedDescription) {
      setError('Informe a descrição do produto.')
      return
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Informe um preço válido maior que zero.')
      return
    }

    if (!parsedCategoryId) {
      setError('Selecione uma categoria.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        name: trimmedName,
        description: trimmedDescription,
        price: parsedPrice,
        categoryId: parsedCategoryId,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar produto.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormSheet
      open={open}
      title={isEditing ? 'Editar produto' : 'Novo produto'}
      description="Preencha os dados do produto."
      submitLabel={isEditing ? 'Atualizar' : 'Criar'}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
    >
      <div className="space-y-4">
        <FormField label="Nome" htmlFor="product-name">
          <Input
            id="product-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Notebook Pro"
            autoFocus
          />
        </FormField>

        <FormField label="Descrição" htmlFor="product-description">
          <Input
            id="product-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descreva o produto"
          />
        </FormField>

        <FormField label="Preço" htmlFor="product-price">
          <Input
            id="product-price"
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(event) => setPrice(maskCurrencyInput(event.target.value))}
            placeholder="R$ 0,00"
          />
        </FormField>

        <FormField label="Categoria" htmlFor="product-category">
          <select
            id="product-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        {categories.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            Cadastre uma categoria antes de criar produtos.
          </p>
        ) : null}

        {error ? <p className="text-destructive text-xs">{error}</p> : null}
      </div>
    </FormSheet>
  )
}
