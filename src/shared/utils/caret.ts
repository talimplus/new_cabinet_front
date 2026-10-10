/**
 * Rewrites an input with its re-formatted text and keeps the caret after the
 * same number of significant characters. Without this a mask that inserts
 * spaces (`100 000`, `97 752 20 14`) threw the caret to the end on every
 * keystroke, so a digit could not be fixed in the middle.
 */
export function rewriteKeepingCaret(
  el: HTMLInputElement,
  formatted: string,
  isSignificant: (char: string) => boolean = (c) => /[\d.,]/.test(c),
): void {
  if (el.value === formatted) return
  const focused = el.ownerDocument.activeElement === el
  const caret = el.selectionStart ?? el.value.length
  const before = [...el.value.slice(0, caret)].filter(isSignificant).length
  el.value = formatted
  if (!focused) return
  let pos = 0
  for (let seen = 0; pos < formatted.length && seen < before; pos++) {
    if (isSignificant(formatted[pos]!)) seen++
  }
  el.setSelectionRange(pos, pos)
}
