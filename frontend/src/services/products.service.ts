import { api } from '@/services/api-client'
import type {
  CreateProductInput,
  ListProductsParams,
  PaginatedResponse,
  Product,
  UpdateProductInput,
} from '@/types/catalog'

function buildQuery(params?: ListProductsParams) {
  const searchParams = new URLSearchParams()

  if (params?.page) {
    searchParams.set('page', String(params.page))
  }

  if (params?.limit) {
    searchParams.set('limit', String(params.limit))
  }

  if (params?.search) {
    searchParams.set('search', params.search)
  }

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export const productsService = {
  list(params?: ListProductsParams) {
    return api<PaginatedResponse<Product>>(`/products${buildQuery(params)}`)
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
