export interface PaginationMeta {
  total: number
  page?: number
  perPage?: number
  totalPages?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
