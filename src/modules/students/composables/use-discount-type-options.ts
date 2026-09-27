import { computed, type ComputedRef } from 'vue'
import { t } from '@/locales'
import { DiscountType, DISCOUNT_TYPE_LABEL_KEYS } from '../enums/discount-type.enum'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

/** "Percent / Amount" select options, relabelled when the language changes. */
export function useDiscountTypeOptions(): ComputedRef<SelectOption[]> {
  return computed(() =>
    Object.values(DiscountType).map((value) => ({ value, label: t(DISCOUNT_TYPE_LABEL_KEYS[value]) })),
  )
}
