import { describe, it, expect } from 'vitest'
import {
  editablePhoneDigits,
  formatPhone,
  groupLocalDigits,
  isValidUzPhone,
  normalizePhone,
  phoneHref,
  uzLocalDigits,
} from '../format-phone'

// Every spelling found in the database for the same number.
const SPELLINGS = ['97-752-20-14', '977522014', '+998977522014', '998 97 752 20 14', '(97) 752 20 14']

describe('format-phone', () => {
  it.each(SPELLINGS)('reads %s as the same local number', (raw) => {
    expect(uzLocalDigits(raw)).toBe('977522014')
    expect(formatPhone(raw)).toBe('+998 97 752 20 14')
    expect(normalizePhone(raw)).toBe('+998977522014')
    expect(isValidUzPhone(raw)).toBe(true)
  })

  it('leaves a value that is not an Uzbek number as typed (trimmed)', () => {
    expect(uzLocalDigits('900 0000')).toBeNull()
    expect(formatPhone(' 900 0000 ')).toBe('900 0000')
    expect(normalizePhone(' +7 999 123 45 67 ')).toBe('+7 999 123 45 67')
    expect(isValidUzPhone('12345')).toBe(false)
  })

  it('treats empty values as empty', () => {
    expect(formatPhone(null)).toBe('')
    expect(formatPhone(undefined)).toBe('')
    expect(normalizePhone('')).toBe('')
    expect(isValidUzPhone('')).toBe(false)
  })

  it('groups partial input as far as it goes', () => {
    expect(groupLocalDigits('9')).toBe('9')
    expect(groupLocalDigits('9775')).toBe('97 75')
    expect(groupLocalDigits('9775220')).toBe('97 752 20')
    expect(groupLocalDigits('977522014')).toBe('97 752 20 14')
  })

  it('editable digits drop a pasted 998 prefix and cap at 9', () => {
    expect(editablePhoneDigits('97752201499')).toBe('977522014')
    expect(editablePhoneDigits('+998977522014')).toBe('977522014')
    expect(editablePhoneDigits('')).toBe('')
    // A 99-operator number plus a stray keystroke keeps its digits.
    expect(editablePhoneDigits('9981234567')).toBe('998123456')
    // The field's own partial value: `+998` is the prefix, not local digits.
    expect(editablePhoneDigits('+9989')).toBe('9')
    expect(editablePhoneDigits('+99899812')).toBe('99812')
  })

  it('builds a dialable tel: link', () => {
    expect(phoneHref('97-752-20-14')).toBe('tel:+998977522014')
    expect(phoneHref('900 0000')).toBe('tel:9000000')
  })
})
