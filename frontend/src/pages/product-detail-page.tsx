import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'

import { ProductFormDialog } from '@/components/products/product-form-dialog'
import { ErrorState, LoadingState } from '@/components/crud/status-message'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProduct } from '@/hooks/use-product'
import { formatPrice } from '@/lib/formatters'

export function ProductDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const productId = Number(id)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { product, isLoading, error, removeProduct, updateProduct } =
    useProduct(productId)

  if (!Number.isFinite(productId)) {
    return (
      <div className="p-6">
        <ErrorState message="Produto inválido." />
      </div>
    )
  }

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
      navigate('/produtos')
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : 'Erro ao excluir produto.',
      )
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link
            to="/produtos"
            className="hover:bg-muted inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Detalhes do produto
          </h1>
        </div>

        {product ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <Pencil className="size-4" data-icon="inline-start" />
              Editar
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()}>
              <Trash2 className="size-4" data-icon="inline-start" />
              Excluir
            </Button>
          </div>
        ) : null}
      </div>

      <div className="p-6">
        {isLoading ? (
          <LoadingState message="Carregando produto..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : product ? (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">ID</p>
                <p>{product.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Descrição</p>
                <p>{product.description}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Categoria</p>
                <Badge variant="secondary">
                  {product.category?.name ?? '—'}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Preço</p>
                <p className="text-lg font-semibold">
                  {formatPrice(product.price)}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ErrorState message="Produto não encontrado." />
        )}
      </div>

      <ProductFormDialog
        open={dialogOpen}
        product={product}
        onClose={() => setDialogOpen(false)}
        onSubmit={updateProduct}
      />
    </div>
  )
}
