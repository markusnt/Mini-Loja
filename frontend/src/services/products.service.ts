import { api } from '@/services/api-client'
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from '@/types/catalog'

export const productsService = {
  list(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : ''
    return api<Product[]>(`/products${query}`)
  },

  getById(id: number) {
    return api<Product>(`/products/${id}`)
  },

  create(data: CreateProductInput) {
    return api<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update(id: number, data: UpdateProductInput) {
    return api<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  remove(id: number) {
    return api<void>(`/products/${id}`, { method: 'DELETE' })
  },
}
