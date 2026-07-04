import { useState } from 'react'

import {
  CategoryDetailPanel,
  parseCategoryDeleteError,
} from '@/components/categories/category-detail-panel'
import { CategoryFormSheet } from '@/components/categories/category-form-sheet'
import { CategoriesTable } from '@/components/categories/categories-table'
import { InlineAlert } from '@/components/crud/inline-alert'
import { PageHeader } from '@/components/crud/page-header'
import { SearchInput } from '@/components/crud/search-input'
import { ErrorState, LoadingState } from '@/components/crud/status-message'
import { useCategories } from '@/hooks/use-categories'
import {
  getCategoryDeleteBlockReason,
  isCategoryDeleteBlocked,
} from '@/lib/category-rules'
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
    reload,
  } = useCategories()

  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [viewingCategoryId, setViewingCategoryId] = useState<number | null>(
    null,
  )
  const [actionError, setActionError] = useState<string | null>(null)

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
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
    if (isCategoryDeleteBlocked(category)) {
      setActionError(getCategoryDeleteBlockReason(category._count?.products ?? 0))
      return
    }

    const confirmed = window.confirm(
      `Deseja excluir a categoria "${category.name}"?`,
    )

    if (!confirmed) {
      return
    }

    setActionError(null)

    try {
      await removeCategory(category.id)
    } catch (err) {
      setActionError(parseCategoryDeleteError(err))
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

      <div className="flex flex-1 flex-col gap-4 overflow-x-hidden p-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar categoria..."
        />

        {actionError ? (
          <InlineAlert
            message={actionError}
            onDismiss={() => setActionError(null)}
          />
        ) : null}

        {isLoading ? (
          <LoadingState message="Carregando categorias..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <CategoriesTable
            categories={categories}
            onView={(category) => setViewingCategoryId(category.id)}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <CategoryFormSheet
        open={formOpen}
        category={editingCategory}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />

      <CategoryDetailPanel
        open={viewingCategoryId !== null}
        categoryId={viewingCategoryId}
        onClose={() => setViewingCategoryId(null)}
        onMutated={reload}
        onActionError={setActionError}
      />
    </div>
  )
}
