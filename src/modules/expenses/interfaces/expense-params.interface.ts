/** Query params for GET /expenses. `forMonth` is "YYYY-MM". */
export interface ExpensesParams {
  page?: number
  perPage?: number
  forMonth?: string
  centerId?: number
  search?: string
}
