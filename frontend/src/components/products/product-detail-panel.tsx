import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

import { ErrorState, LoadingState } from '@/components/crud/status-message'
import { ProductFormDialog } from '@/components/products/product-form-dialog'
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
import { useProduct } from '@/hooks/use-product'
import { formatPrice } from '@/lib/formatters'

type ProductDetailPanelProps = {
  productId: number | null
  open: boolean
  onClose: () => void
  onMutated?: () => void
}

export function ProductDetailPanel({
  productId,
  open,
  onClose,
  onMutated,
}: ProductDetailPanelProps) {
  const [editOpen, setEditOpen] = useState(false)
  const { product, isLoading, error, removeProduct, updateProduct } = useProduct(
    open ? productId : null,
  )

  const handleDelete = async () => {
    if (!product) {
      return
    }

    const confirmed = window.confirm(
      `Deseja excluir o produto "${product.name}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      await removeProduct()
      onMutated?.()
      onClose()
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : 'Erro ao excluir produto.',
      )
    }
  }

  const handleUpdate = async (data: {
    name: string
    description: string
    price: number
    categoryId: number
  }) => {
    await updateProduct(data)
    onMutated?.()
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            onClose()
          }
        }}
      >
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{product?.name ?? 'Detalhes do produto'}</SheetTitle>
            <SheetDescription>
              Informações completas do produto.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4">
            {isLoading ? (
              <LoadingState message="Carregando produto..." />
            ) : error ? (
              <ErrorState message={error} />
            ) : product ? (
              <dl className="space-y-4">
                <div>
                  <dt className="text-muted-foreground text-sm">ID</dt>
                  <dd>{product.id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-sm">Descrição</dt>
                  <dd>{product.description}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-sm">Categoria</dt>
                  <dd>
                    <Badge variant="secondary">
                      {product.category?.name ?? '—'}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-sm">Preço</dt>
                  <dd className="text-lg font-semibold">
                    {formatPrice(product.price)}
                  </dd>
                </div>
              </dl>
            ) : (
              <ErrorState message="Produto não encontrado." />
            )}
          </div>

          {product ? (
            <SheetFooter className="flex-row justify-end">
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" data-icon="inline-start" />
                Editar
              </Button>
              <Button variant="destructive" onClick={() => void handleDelete()}>
                <Trash2 className="size-4" data-icon="inline-start" />
                Excluir
              </Button>
            </SheetFooter>
          ) : null}
        </SheetContent>
      </Sheet>

      <ProductFormDialog
        open={editOpen}
        product={product}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
      />
    </>
  )
}
