import { describe, it, expect, afterEach } from 'vitest'
import { rewriteKeepingCaret } from '../caret'

function focusedInput(value: string, caret: number): HTMLInputElement {
  const el = document.createElement('input')
  document.body.appendChild(el)
  el.value = value
  el.focus()
  el.setSelectionRange(caret, caret)
  return el
}
afterEach(() => {
  document.body.innerHTML = ''
})

describe('rewriteKeepingCaret', () => {
  it('keeps the caret after the same digit when a group space is added', () => {
    // "10000|0" typed in the middle → "100 00|0"
    const el = focusedInput('100000', 5)
    rewriteKeepingCaret(el, '100 000')
    expect(el.value).toBe('100 000')
    expect(el.selectionStart).toBe(6)
  })

  it('puts the caret at the end after the last digit', () => {
    const el = focusedInput('10000', 5)
    rewriteKeepingCaret(el, '10 000')
    expect(el.selectionStart).toBe(6)
  })

  it('honours a custom significance test (phone digits)', () => {
    const el = focusedInput('97 7x52', 5)
    rewriteKeepingCaret(el, '97 752', (c) => /\d/.test(c))
    expect(el.value).toBe('97 752')
    expect(el.selectionStart).toBe(4)
  })

  it('leaves an unchanged value alone and skips the caret when not focused', () => {
    const el = document.createElement('input')
    el.value = '1 000'
    rewriteKeepingCaret(el, '1 000')
    expect(el.value).toBe('1 000')
    el.value = '1000'
    rewriteKeepingCaret(el, '1 000')
    expect(el.value).toBe('1 000')
  })
})
