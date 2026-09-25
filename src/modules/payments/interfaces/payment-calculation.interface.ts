/** Response from PUT /payments/calculate/{id}. */
export interface PaymentCalculationResponse {
  paymentId: number
  studentId: number
  studentName: string
  forMonth: string
  plannedStudyUntilDate: string
  lessonsPlanned: number
  lessonsBillable: number
  lessonsExcused?: number
  discountPercent: number
  amountDue: number
  currentAmountDue: number
  difference: number
}
