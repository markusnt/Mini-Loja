import { useState } from 'react'

import { CategoryFormDialog } from '@/components/categories/category-form-dialog'
import { CategoriesTable } from '@/components/categories/categories-table'
import { PageHeader } from '@/components/crud/page-header'
import { SearchInput } from '@/components/crud/search-input'
import { ErrorState, LoadingState } from '@/components/crud/status-message'
import { useCategories } from '@/hooks/use-categories'
import type { Category } from '@/types/catalog'

export function CategoriesPage() {
  const {
    categories,
    search,
    setSearch,
    isLoading,
    error,
    removeCategory,
    createCategory,
    updateCategory,
  } = useCategories()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingCategory(null)
  }

  const handleSubmit = async (name: string) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, { name })
      return
    }

    await createCategory({ name })
  }

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(
      `Deseja excluir a categoria "${category.name}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      await removeCategory(category.id)
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : 'Erro ao excluir categoria.',
      )
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Categorias"
        description="Gerencie as categorias dos produtos da loja."
        actionLabel="Nova categoria"
        onAction={handleOpenCreate}
      />

      <div className="flex flex-1 flex-col gap-4 p-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar categoria..."
        />

        {isLoading ? (
          <LoadingState message="Carregando categorias..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <CategoriesTable
            categories={categories}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <CategoryFormDialog
        open={dialogOpen}
        category={editingCategory}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
