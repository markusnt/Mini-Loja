import { useCallback, useEffect, useState } from 'react'

import { productsService } from '@/services/products.service'
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from '@/types/catalog'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = useCallback(async (term?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await productsService.list(term)
      setProducts(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar produtos.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadProducts(search)
    }, 300)

    return () => clearTimeout(timeout)
  }, [loadProducts, search])

  const removeProduct = useCallback(
    async (id: number) => {
      await productsService.remove(id)
      await loadProducts(search)
    },
    [loadProducts, search],
  )

  const createProduct = useCallback(
    async (data: CreateProductInput) => {
      await productsService.create(data)
      await loadProducts(search)
    },
    [loadProducts, search],
  )

  const updateProduct = useCallback(
    async (id: number, data: UpdateProductInput) => {
      await productsService.update(id, data)
      await loadProducts(search)
    },
    [loadProducts, search],
  )

  return {
    products,
    search,
    setSearch,
    isLoading,
    error,
    reload: () => loadProducts(search),
    removeProduct,
    createProduct,
    updateProduct,
  }
}
