/** Month options for the payment month tab strip. `value` is the `MM` string. */
export interface PaymentMonth {
  /** i18n key — the tab strip translates it. */
  labelKey: string
  value: string
}

export const PAYMENT_MONTHS: PaymentMonth[] = Array.from({ length: 12 }, (_, i) => {
  const value = String(i + 1).padStart(2, '0')
  return { value, labelKey: `common.monthsShort.${value}` }
})
