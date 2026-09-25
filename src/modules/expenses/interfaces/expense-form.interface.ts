/** POST /expenses and PUT /expenses/:id body. `forMonth` is "YYYY-MM". */
export interface ExpenseForm {
  centerId: number
  name: string
  amount: number
  description: string
  forMonth: string
}
