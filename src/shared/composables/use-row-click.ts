/**
 * Elements whose own click must never open the row: action buttons, links,
 * form controls, status selects/dropdowns, and anything a table marks with
 * `data-no-row-click` (the actions cell, a `TableColumn.noRowClick` cell).
 */
const INTERACTIVE = [
  'button', 'a', 'input', 'select', 'textarea', 'label', 'summary', '[contenteditable]',
  '[role="button"]', '[role="checkbox"]', '[role="switch"]', '[role="combobox"]',
  '[role="listbox"]', '[role="option"]', '[role="menuitem"]', '[data-no-row-click]',
].join(',')

/**
 * Whole-row navigation for `UiTable` / `UiTableCards` — replaces the "eye"
 * button. A click that started on (or inside) an interactive element, or that
 * ends a text selection (copying a phone), is ignored. Clicks inside teleported
 * popovers never reach the row, since they are not DOM descendants of it.
 */
export function useRowClick<T>(handler: () => ((row: T) => void) | undefined) {
  function shouldIgnore(event: Event): boolean {
    const row = event.currentTarget as HTMLElement | null
    const hit = (event.target as HTMLElement | null)?.closest?.(INTERACTIVE)
    if (hit && row?.contains(hit)) return true
    return !!window.getSelection?.()?.toString()
  }

  function onClick(row: T, event: MouseEvent): void {
    const open = handler()
    if (open && !shouldIgnore(event)) open(row)
  }

  /** Enter on the focused row itself (rows are focusable when clickable). */
  function onKeydown(row: T, event: KeyboardEvent): void {
    const open = handler()
    if (open && event.key === 'Enter' && event.target === event.currentTarget) open(row)
  }

  return { onClick, onKeydown }
}
