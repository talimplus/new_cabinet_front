/** The center summary embedded in an expense row (GET /expenses). */
export interface ExpenseCenter {
  id: number
  name: string
}

/**
 * An expense row from GET /expenses and GET /expenses/:id.
 * ⚠️ `amount` arrives as a STRING (e.g. "12345.00") on GET — coerce with Number().
 * `forMonth` arrives as "YYYY-MM-DD" on GET (POST accepts "YYYY-MM").
 */
export interface Expense {
  id: number
  centerId: number
  name: string
  amount: string | number
  description: string
  forMonth: string
  createdAt: string
  center?: ExpenseCenter
}
