import { describe, it, expect } from 'vitest'
import { useReceiptSelection } from '../use-receipt-selection'
import { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import type { PendingReceipt } from '../../interfaces/pending-receipt.interface'

function makeReceipt(overrides: Partial<PendingReceipt> = {}): PendingReceipt {
  return {
    id: 1,
    paymentId: 11,
    amount: '250000',
    receivedById: 2,
    receivedAt: '2025-09-01T10:00:00Z',
    confirmedById: null,
    confirmedAt: null,
    status: ReceiptStatus.PENDING,
    comment: null,
    createdAt: '2025-09-01T10:00:00Z',
    payment: {
      id: 11,
      studentId: 5,
      groupId: 3,
      forMonth: '2025-09',
      student: { firstName: 'Ali', lastName: 'Valiyev' },
      group: { name: 'Ingliz A1' },
    },
    ...overrides,
  }
}

describe('useReceiptSelection', () => {
  it('toggle adds then removes a receipt, count/ids follow', () => {
    const page = [makeReceipt({ id: 1 })]
    const sel = useReceiptSelection(() => page)

    sel.toggle(page[0]!)
    expect(sel.count.value).toBe(1)
    expect(sel.ids.value).toEqual([1])
    expect(sel.isSelected(1)).toBe(true)

    sel.toggle(page[0]!)
    expect(sel.count.value).toBe(0)
    expect(sel.ids.value).toEqual([])
    expect(sel.isSelected(1)).toBe(false)
  })

  it('amount sums parseFloat(amount) — a backend STRING — and tolerates a non-numeric amount', () => {
    const page = [
      makeReceipt({ id: 1, amount: '100000' }),
      makeReceipt({ id: 2, amount: '50000.5' }),
      makeReceipt({ id: 3, amount: 'not-a-number' }),
    ]
    const sel = useReceiptSelection(() => page)
    page.forEach((r) => sel.toggle(r))

    expect(sel.amount.value).toBeCloseTo(150000.5)
  })

  it('selection survives paging: a row selected on page 1 is still counted after the rows getter swaps to page 2', () => {
    let page = [makeReceipt({ id: 1, amount: '10000' })]
    const sel = useReceiptSelection(() => page)

    sel.toggle(page[0]!)
    expect(sel.count.value).toBe(1)

    // Swap the getter's result to a different page — the receipt is gone from
    // `rows()`, but the selection must still know about it.
    page = [makeReceipt({ id: 2, amount: '20000' })]

    expect(sel.count.value).toBe(1)
    expect(sel.ids.value).toEqual([1])
    expect(sel.amount.value).toBe(10000)
  })

  describe('allOnPage / someOnPage', () => {
    it('both false on an empty page', () => {
      const sel = useReceiptSelection(() => [])
      expect(sel.allOnPage.value).toBe(false)
      expect(sel.someOnPage.value).toBe(false)
    })

    it('someOnPage is true when one of two rows is picked', () => {
      const page = [makeReceipt({ id: 1 }), makeReceipt({ id: 2 })]
      const sel = useReceiptSelection(() => page)

      sel.toggle(page[0]!)

      expect(sel.someOnPage.value).toBe(true)
      expect(sel.allOnPage.value).toBe(false)
    })

    it('allOnPage is true (and someOnPage false) when both are picked', () => {
      const page = [makeReceipt({ id: 1 }), makeReceipt({ id: 2 })]
      const sel = useReceiptSelection(() => page)

      sel.toggle(page[0]!)
      sel.toggle(page[1]!)

      expect(sel.allOnPage.value).toBe(true)
      expect(sel.someOnPage.value).toBe(false)
    })
  })

  describe('togglePage', () => {
    it('true selects every row of the current page', () => {
      const page = [makeReceipt({ id: 1 }), makeReceipt({ id: 2 })]
      const sel = useReceiptSelection(() => page)

      sel.togglePage(true)

      expect(sel.count.value).toBe(2)
      expect(sel.allOnPage.value).toBe(true)
    })

    it('false drops only the current page rows and keeps selections from other pages', () => {
      const page = [makeReceipt({ id: 1 }), makeReceipt({ id: 2 })]
      const sel = useReceiptSelection(() => page)

      // Selected while a different page was showing.
      sel.toggle(makeReceipt({ id: 99 }))
      sel.togglePage(true)
      expect(sel.count.value).toBe(3)

      sel.togglePage(false)

      expect(sel.count.value).toBe(1)
      expect(sel.ids.value).toEqual([99])
    })
  })

  describe('remove', () => {
    it('drops one receipt', () => {
      const page = [makeReceipt({ id: 1 }), makeReceipt({ id: 2 })]
      const sel = useReceiptSelection(() => page)
      sel.togglePage(true)

      sel.remove(1)

      expect(sel.count.value).toBe(1)
      expect(sel.ids.value).toEqual([2])
    })

    it('is a no-op on an unknown id — does not replace the Map unnecessarily', () => {
      const page = [makeReceipt({ id: 1 })]
      const sel = useReceiptSelection(() => page)
      sel.toggle(page[0]!)
      const idsBefore = sel.ids.value

      sel.remove(999)

      // Same computed reference: the underlying ref was never reassigned, so
      // the memoized computed did not re-run.
      expect(sel.ids.value).toBe(idsBefore)
      expect(sel.count.value).toBe(1)
    })
  })

  it('clear() empties everything', () => {
    const page = [makeReceipt({ id: 1 }), makeReceipt({ id: 2 })]
    const sel = useReceiptSelection(() => page)
    sel.togglePage(true)

    sel.clear()

    expect(sel.count.value).toBe(0)
    expect(sel.ids.value).toEqual([])
    expect(sel.amount.value).toBe(0)
  })
})
