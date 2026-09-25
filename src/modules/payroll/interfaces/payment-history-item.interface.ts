/** One prior payment against a staff salary (shown in the pay modal history). */
export interface PaymentHistoryItem {
  id: number
  amount: number
  comment: string | null
  paidAt: string
  paidBy: {
    id: number
    firstName: string
    lastName: string
  }
}
