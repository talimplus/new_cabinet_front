/**
 * How a discount is expressed. UI-side switch: the backend stores it as
 * `percent` (0..100) OR `amount` (so'm per month) — exactly one of them > 0.
 */
export enum DiscountType {
  PERCENT = 'percent',
  AMOUNT = 'amount',
}

export const DISCOUNT_TYPE_LABEL_KEYS: Record<DiscountType, string> = {
  [DiscountType.PERCENT]: 'students.form.discountTypes.percent',
  [DiscountType.AMOUNT]: 'students.form.discountTypes.amount',
}
