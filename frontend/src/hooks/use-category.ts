import { useCallback, useEffect, useState } from 'react'

import { categoriesService } from '@/services/categories.service'
import type { Category } from '@/types/catalog'

export function useCategory(id: number | null) {
  const [category, setCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCategory = useCallback(async () => {
    if (!id || !Number.isFinite(id)) {
      setCategory(null)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await categoriesService.getById(id)
      setCategory(data)
    } catch (err) {
      setCategory(null)
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar categoria.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    void loadCategory()
  }, [loadCategory])

  const removeCategory = useCallback(async () => {
    if (!id) {
      return
    }

    await categoriesService.remove(id)
  }, [id])

  const updateCategory = useCallback(
    async (data: { name: string }) => {
      if (!id) {
        return
      }

      const updated = await categoriesService.update(id, data)
      setCategory(updated)
    },
    [id],
  )

  return {
    category,
    isLoading,
    error,
    reload: loadCategory,
    removeCategory,
    updateCategory,
  }
}
