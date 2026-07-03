import { useCallback, useEffect, useState } from 'react'

import { productsService } from '@/services/products.service'
import type {
  CreateProductInput,
  PaginatedMeta,
  Product,
  UpdateProductInput,
} from '@/types/catalog'

const DEFAULT_LIMIT = 10

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<PaginatedMeta>({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = useCallback(
    async (term?: string, currentPage = page) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await productsService.list({
          page: currentPage,
          limit: DEFAULT_LIMIT,
          search: term,
        })

        setProducts(response.data)
        setMeta(response.meta)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar produtos.',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [page],
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadProducts(search, page)
    }, 300)

    return () => clearTimeout(timeout)
  }, [loadProducts, search, page])

  useEffect(() => {
    setPage(1)
  }, [search])

  const removeProduct = useCallback(
    async (id: number) => {
      await productsService.remove(id)
      await loadProducts(search, page)
    },
    [loadProducts, page, search],
  )

  const createProduct = useCallback(
    async (data: CreateProductInput) => {
      await productsService.create(data)
      setPage(1)
      await loadProducts(search, 1)
    },
    [loadProducts, search],
  )

  const updateProduct = useCallback(
    async (id: number, data: UpdateProductInput) => {
      await productsService.update(id, data)
      await loadProducts(search, page)
    },
    [loadProducts, page, search],
  )

  const nextPage = () => {
    if (page < meta.totalPages) {
      setPage((current) => current + 1)
    }
  }

  const prevPage = () => {
    if (page > 1) {
      setPage((current) => current - 1)
    }
  }

  return {
    products,
    search,
    setSearch,
    page,
    meta,
    isLoading,
    error,
    nextPage,
    prevPage,
    reload: () => loadProducts(search, page),
    removeProduct,
    createProduct,
    updateProduct,
  }
}
