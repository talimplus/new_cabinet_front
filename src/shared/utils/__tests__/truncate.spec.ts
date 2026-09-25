import { describe, it, expect } from 'vitest'
import { truncate } from '../truncate'

describe('truncate', () => {
  it('returns an empty string for empty/null/undefined input', () => {
    expect(truncate('', 10)).toBe('')
    expect(truncate(null, 10)).toBe('')
    expect(truncate(undefined, 10)).toBe('')
  })

  it('returns the string unchanged when shorter than max', () => {
    expect(truncate('short', 20)).toBe('short')
  })

  it('returns the string unchanged when exactly max length (boundary)', () => {
    const text = '1234567890' // length 10
    expect(truncate(text, 10)).toBe(text)
  })

  it('slices to max chars and appends an ellipsis when longer than max (max + 1 boundary)', () => {
    const text = '12345678901' // length 11
    expect(truncate(text, 10)).toBe('1234567890…')
  })

  it('slices a much longer string to max chars plus an ellipsis', () => {
    const text = 'this is a much longer piece of text than the max allows'
    const result = truncate(text, 20)
    expect(result).toBe(`${text.slice(0, 20)}…`)
    expect(result.endsWith('…')).toBe(true)
    expect(result.length).toBe(21)
  })
})
