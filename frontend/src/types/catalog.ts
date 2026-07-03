export type Category = {
  id: number
  name: string
  createdAt?: string
  updatedAt?: string
  _count?: {
    products: number
  }
}

export type Product = {
  id: number
  name: string
  description: string
  price: number
  categoryId: number
  category?: Category
  createdAt?: string
  updatedAt?: string
}

export type CreateCategoryInput = {
  name: string
}

export type UpdateCategoryInput = {
  name?: string
}

export type CreateProductInput = {
  name: string
  description: string
  price: number
  categoryId: number
}

export type UpdateProductInput = {
  name?: string
  description?: string
  price?: number
  categoryId?: number
}

export type ApiError = {
  message: string | string[]
  statusCode: number
}

export type PaginatedMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginatedMeta
}

export type ListProductsParams = {
  page?: number
  limit?: number
  search?: string
}
