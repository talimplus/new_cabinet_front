/**
 * The teacher's share moved between two months' salaries (backend: carryover).
 * Created when a student's payment for a month arrives after that month's
 * salary was already paid out in cash — the share goes to the next salary.
 */
export interface SalaryTransfer {
  id: number
  amount: number
  /** "YYYY-MM-01" — the work month the student paid for. */
  fromMonth: string
  /** "YYYY-MM-01" — the salary it was added to; null = not added yet (next month). */
  toMonth: string | null
  student: { id: number; name: string } | null
  group: { id: number; name: string } | null
  /** When the student handed over the money (ISO). */
  paidAt: string | null
  /** When the payment was confirmed (ISO). */
  confirmedAt: string | null
}
