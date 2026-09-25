export interface GroupsParams {
  /** Optional: the http interceptor injects the header's active center. */
  centerId?: number
  name?: string
  /** Narrows the list to one teacher's groups. */
  teacherId?: number
  page?: number
  perPage?: number
}
