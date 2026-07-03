import { useState } from 'react'

import { PageHeader } from '@/components/crud/page-header'
import { SearchInput } from '@/components/crud/search-input'
import { ErrorState, LoadingState } from '@/components/crud/status-message'
import { ProductFormDialog } from '@/components/products/product-form-dialog'
import { ProductsTable } from '@/components/products/products-table'
import { useProducts } from '@/hooks/use-products'
import type { Product } from '@/types/catalog'

export function ProductsPage() {
  const {
    products,
    search,
    setSearch,
    isLoading,
    error,
    removeProduct,
    createProduct,
    updateProduct,
  } = useProducts()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingProduct(null)
  }

  const handleSubmit = async (data: {
    name: string
    description: string
    price: number
    categoryId: number
  }) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data)
      return
    }

    await createProduct(data)
  }

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Deseja excluir o produto "${product.name}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      await removeProduct(product.id)
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : 'Erro ao excluir produto.',
      )
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Produtos"
        description="Cadastre, edite e remova produtos da loja."
        actionLabel="Novo produto"
        onAction={handleOpenCreate}
      />

      <div className="flex flex-1 flex-col gap-4 p-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar produto..."
        />

        {isLoading ? (
          <LoadingState message="Carregando produtos..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <ProductsTable
            products={products}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <ProductFormDialog
        open={dialogOpen}
        product={editingProduct}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
