import { useCallback, useEffect, useState } from 'react'

import { categoriesService } from '@/services/categories.service'
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types/catalog'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = useCallback(async (term?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await categoriesService.list(term)
      setCategories(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar categorias.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadCategories(search)
    }, 300)

    return () => clearTimeout(timeout)
  }, [loadCategories, search])

  const removeCategory = useCallback(
    async (id: number) => {
      await categoriesService.remove(id)
      await loadCategories(search)
    },
    [loadCategories, search],
  )

  const createCategory = useCallback(
    async (data: CreateCategoryInput) => {
      await categoriesService.create(data)
      await loadCategories(search)
    },
    [loadCategories, search],
  )

  const updateCategory = useCallback(
    async (id: number, data: UpdateCategoryInput) => {
      await categoriesService.update(id, data)
      await loadCategories(search)
    },
    [loadCategories, search],
  )

  return {
    categories,
    search,
    setSearch,
    isLoading,
    error,
    reload: () => loadCategories(search),
    removeCategory,
    createCategory,
    updateCategory,
  }
}
