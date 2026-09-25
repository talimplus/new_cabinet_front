import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { useReceptionForm } from '../use-reception-form'
import { PaymentMethod } from '@/shared/enums/payment-method.enum'

describe('useReceptionForm', () => {
  it('defaults to CASH, a null date and an empty comment', () => {
    const form = useReceptionForm()
    expect(form.method.value).toBe(PaymentMethod.CASH)
    expect(form.paidAt.value).toBeNull()
    expect(form.comment.value).toBe('')
  })

  describe('toForm', () => {
    it('omits paidAt for a cash payment even when a date is set', () => {
      const form = useReceptionForm()
      form.method.value = PaymentMethod.CASH
      form.paidAt.value = new Date(2026, 8, 24)

      expect(form.toForm()).toEqual({
        paymentMethod: PaymentMethod.CASH,
        paidAt: undefined,
        comment: undefined,
      })
    })

    it('omits paidAt for a card payment without a date', () => {
      const form = useReceptionForm()
      form.method.value = PaymentMethod.CARD
      form.paidAt.value = null

      expect(form.toForm().paidAt).toBeUndefined()
    })

    it('formats paidAt as YYYY-MM-DD for a card payment with a date', () => {
      const form = useReceptionForm()
      form.method.value = PaymentMethod.CARD
      form.paidAt.value = new Date(2026, 8, 24)

      expect(form.toForm().paidAt).toBe('2026-09-24')
    })

    it('trims the comment and omits it when blank', () => {
      const form = useReceptionForm()
      form.comment.value = '   '
      expect(form.toForm().comment).toBeUndefined()

      form.comment.value = '  naqd tolandi  '
      expect(form.toForm().comment).toBe('naqd tolandi')
    })
  })

  it('resets the fields when isOpen flips to true', async () => {
    const isOpen = ref(false)
    const form = useReceptionForm(() => isOpen.value)
    form.method.value = PaymentMethod.CARD
    form.paidAt.value = new Date(2026, 8, 24)
    form.comment.value = 'izoh'

    isOpen.value = true
    await nextTick()

    expect(form.method.value).toBe(PaymentMethod.CASH)
    expect(form.paidAt.value).toBeNull()
    expect(form.comment.value).toBe('')
  })
})
