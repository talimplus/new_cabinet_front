import { ref, watch } from 'vue'
import { PaymentMethod } from '@/shared/enums/payment-method.enum'
import { toDateString } from '@/shared/utils/format-date'
import type { PaymentReceptionForm } from '@/shared/interfaces/payment-reception.interface'

/**
 * The "how was the money handed over" block shared by both payment dialogs:
 * method, the card settlement date, and a free comment. Pass the dialog's open
 * flag and the fields clear themselves every time it is reopened.
 */
export function useReceptionForm(isOpen?: () => boolean) {
  const method = ref<PaymentMethod>(PaymentMethod.CASH)
  const paidAt = ref<Date | null>(null)
  const comment = ref('')

  function reset(): void {
    method.value = PaymentMethod.CASH
    paidAt.value = null
    comment.value = ''
  }

  if (isOpen) watch(isOpen, (open) => { if (open) reset() })

  /** `paidAt` only travels with a card payment — it is meaningless otherwise. */
  function toForm(): PaymentReceptionForm {
    const card = method.value === PaymentMethod.CARD
    return {
      paymentMethod: method.value,
      paidAt: card && paidAt.value ? toDateString(paidAt.value) : undefined,
      comment: comment.value.trim() || undefined,
    }
  }

  return { method, paidAt, comment, reset, toForm }
}
