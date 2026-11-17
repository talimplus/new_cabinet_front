import { computed, ref, watch } from 'vue'
import { formatSom } from '@/shared/utils/format-money'
import { payableAfterExclusion, payableNow } from '../utils/payable'
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

  /**
   * The write-off alone closes the month — no money is taken, the amount is 0.
   * A row already covered by unconfirmed money stays locked, as before.
   */
  const writeOffOnly = computed(
    () =>
      exclusion.value.active &&
      !!exclusion.value.preview &&
      payable.value <= 0 &&
      payableNow(payment()) > 0,
  )

  const error = computed(() => {
    const value = amount.value
    if (value == null || writeOffOnly.value) return undefined
    if (value <= 0) return t('payments.validation.amountGreaterThanZero')
    if (value > payable.value) {
      return t('payments.validation.amountNotExceed', { amount: formatSom(payable.value) })
    }
    return undefined
  })

  const valid = computed(
    () =>
      (!!amount.value || writeOffOnly.value) &&
      !error.value &&
      !exclusion.value.previewing &&
      exclusion.value.valid,
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
      // Collectable now: unconfirmed money is not taken twice.
      amount.value = payableAfterExclusion(payment(), state)
    }
  }

  function reset(): void {
    amount.value = null
    exclusion.value = emptyExclusionState()
  }

  watch(isOpen, (open) => { if (open) reset() })
  // A recalculation overrides the amount — reception takes what it computed.
  watch(calculation, (calc) => { if (calc) amount.value = writeOffOnly.value ? 0 : calc.amountDue })
  // Nothing is collected on a write-off-only save — the field must not suggest otherwise.
  watch(writeOffOnly, (only) => { if (only) amount.value = 0 })

  return { amount, exclusion, payable, writeOffOnly, error, valid, setExclusion, reset }
}
