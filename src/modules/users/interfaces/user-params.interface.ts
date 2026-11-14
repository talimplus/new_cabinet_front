/** Query params for GET /users/employees. */
export interface UsersParams {
  centerId?: number
  name?: string
  phone?: string
  /** `true` — only dismissed employees (archive); otherwise working ones. */
  archived?: boolean
  page?: number
  perPage?: number
}
