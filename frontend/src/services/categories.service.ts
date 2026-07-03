import { api } from '@/services/api-client'
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types/catalog'

export const categoriesService = {
  list(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : ''
    return api<Category[]>(`/categories${query}`)
  },

  getById(id: number) {
    return api<Category>(`/categories/${id}`)
  },

  create(data: CreateCategoryInput) {
    return api<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update(id: number, data: UpdateCategoryInput) {
    return api<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  remove(id: number) {
    return api<void>(`/categories/${id}`, { method: 'DELETE' })
  },
}
