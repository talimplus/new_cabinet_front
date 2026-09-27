import { describe, it, expect } from 'vitest'
import { formatDiscount } from '../format-discount'
import { formatSom } from '@/shared/utils/format-money'

describe('formatDiscount', () => {
  it('formats a percent', () => {
    expect(formatDiscount(10, 0)).toBe('10%')
    expect(formatDiscount('15', null)).toBe('15%')
  })

  it('formats an amount as money (the amount wins over a zero percent)', () => {
    expect(formatDiscount(0, 20000)).toBe(formatSom(20000))
    expect(formatDiscount('0', '20000')).toBe(formatSom(20000))
  })

  it('returns null when there is no discount', () => {
    expect(formatDiscount(0, 0)).toBeNull()
    expect(formatDiscount(null, undefined)).toBeNull()
    expect(formatDiscount('', '')).toBeNull()
  })
})
