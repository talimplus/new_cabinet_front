import { computed, ref } from 'vue'
import type { PendingReceipt } from '../interfaces/pending-receipt.interface'

/**
 * Tick-boxes that survive paging. The whole receipt is kept (not just its id)
 * because the toolbar shows the selected SUM, and a row selected on page 1 is
 * no longer in `rows` once the admin walks to page 2.
 */
export function useReceiptSelection(rows: () => PendingReceipt[]) {
  const selected = ref(new Map<number, PendingReceipt>())

  const ids = computed(() => [...selected.value.keys()])
  const count = computed(() => selected.value.size)
  const amount = computed(() =>
    [...selected.value.values()].reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0),
  )

  const isSelected = (id: number): boolean => selected.value.has(id)

  const allOnPage = computed(
    () => rows().length > 0 && rows().every((r) => selected.value.has(r.id)),
  )
  const someOnPage = computed(
    () => !allOnPage.value && rows().some((r) => selected.value.has(r.id)),
  )

  // The Map is replaced rather than mutated so computeds re-run.
  function toggle(receipt: PendingReceipt): void {
    const next = new Map(selected.value)
    if (next.has(receipt.id)) next.delete(receipt.id)
    else next.set(receipt.id, receipt)
    selected.value = next
  }

  /** Header tick-box: add or drop every row of the current page at once. */
  function togglePage(value: boolean): void {
    const next = new Map(selected.value)
    for (const r of rows()) {
      if (value) next.set(r.id, r)
      else next.delete(r.id)
    }
    selected.value = next
  }

  /** A receipt that has just been confirmed or rejected must leave the set. */
  function remove(id: number): void {
    if (!selected.value.has(id)) return
    const next = new Map(selected.value)
    next.delete(id)
    selected.value = next
  }

  function clear(): void {
    selected.value = new Map()
  }

  return { ids, count, amount, isSelected, allOnPage, someOnPage, toggle, togglePage, remove, clear }
}
