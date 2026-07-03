import { useCallback, useEffect, useState } from 'react'

import { productsService } from '@/services/products.service'
import type { Product } from '@/types/catalog'

export function useProduct(id: number) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProduct = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await productsService.getById(id)
      setProduct(data)
    } catch (err) {
      setProduct(null)
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar produto.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    void loadProduct()
  }, [loadProduct])

  const removeProduct = useCallback(async () => {
    await productsService.remove(id)
  }, [id])

  const updateProduct = useCallback(
    async (data: {
      name: string
      description: string
      price: number
      categoryId: number
    }) => {
      const updated = await productsService.update(id, data)
      setProduct(updated)
    },
    [id],
  )

  return {
    product,
    isLoading,
    error,
    reload: loadProduct,
    removeProduct,
    updateProduct,
  }
}
