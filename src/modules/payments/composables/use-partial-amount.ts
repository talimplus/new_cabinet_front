import { computed, ref, watch } from 'vue'
import { formatSom } from '@/shared/utils/format-money'
import { payableAfterExclusion } from '../utils/payable'
import { emptyExclusionState } from '../interfaces/payment-exclusion.interface'
import { t } from '@/locales'
import type { Payment } from '../interfaces/payment.interface'
import type { PaymentCalculationResponse } from '../interfaces/payment-calculation.interface'
import type { ExclusionState } from '../interfaces/payment-exclusion.interface'

/**
 * The amount field of the partial-payment dialog and everything that moves it:
 * the optional write-off, a recalculation, the ceiling it must stay under, and
 * the validity the confirm button reads.
 */
export function usePartialAmount(
  payment: () => Payment | null,
  calculation: () => PaymentCalculationResponse | null,
  isOpen: () => boolean,
) {
  const amount = ref<number | null>(null)
  const exclusion = ref<ExclusionState>(emptyExclusionState())

  /** Never more than what is still collectable from the student. */
  const payable = computed(() => payableAfterExclusion(payment(), exclusion.value))

  const error = computed(() => {
    const value = amount.value
    if (value == null) return undefined
    if (value <= 0) return t('payments.validation.amountGreaterThanZero')
    if (value > payable.value) {
      return t('payments.validation.amountNotExceed', { amount: formatSom(payable.value) })
    }
    return undefined
  })

  const valid = computed(
    () => !!amount.value && !error.value && !exclusion.value.previewing && exclusion.value.valid,
  )

  /**
   * A freshly computed write-off total is what reception actually collects, so
   * refill the amount — but only when the number really changed, or typing the
   * reason would keep resetting a hand-entered amount.
   */
  function setExclusion(state: ExclusionState): void {
    const previous = exclusion.value.preview?.newRemaining
    exclusion.value = state
    if (state.active && state.preview && state.preview.newRemaining !== previous) {
      amount.value = state.preview.newRemaining
    }
  }

  function reset(): void {
    amount.value = null
    exclusion.value = emptyExclusionState()
  }

  watch(isOpen, (open) => { if (open) reset() })
  // A recalculation overrides the amount — reception takes what it computed.
  watch(calculation, (calc) => { if (calc) amount.value = calc.amountDue })

  return { amount, exclusion, payable, error, valid, setExclusion, reset }
}
