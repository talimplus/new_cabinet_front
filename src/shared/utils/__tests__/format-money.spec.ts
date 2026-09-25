import { describe, it, expect } from 'vitest'
import { formatMoney, formatSom, formatMoneyShort } from '../format-money'
import { t } from '@/locales'

// Intl 'ru-RU' groups thousands with a (possibly non-breaking) space; normalize
// any Unicode whitespace to a plain space so assertions are ICU-independent.
const normalize = (s: string) => s.replace(/\s/g, ' ')

describe('formatMoney', () => {
  it('formats large numbers with space thousands separators', () => {
    expect(normalize(formatMoney(48200000))).toBe('48 200 000')
  })

  it('formats small numbers without a separator', () => {
    expect(formatMoney(500)).toBe('500')
    expect(formatMoney(0)).toBe('0')
  })

  it('drops fractional digits', () => {
    expect(normalize(formatMoney(1999.99))).toBe('2 000')
  })

  it('returns the em dash for null', () => {
    expect(formatMoney(null)).toBe('—')
  })

  it('returns the em dash for undefined', () => {
    expect(formatMoney(undefined)).toBe('—')
  })

  it('returns the em dash for NaN', () => {
    expect(formatMoney(Number.NaN)).toBe('—')
  })
})

describe('formatSom', () => {
  it('appends the translated currency suffix to a formatted amount', () => {
    expect(normalize(formatSom(48200000))).toBe(`48 200 000 ${t('common.sum')}`)
  })

  it('appends the suffix even for zero', () => {
    expect(formatSom(0)).toBe(`0 ${t('common.sum')}`)
  })

  it('returns the em dash (without suffix) for null', () => {
    expect(formatSom(null)).toBe('—')
  })

  it('returns the em dash (without suffix) for undefined', () => {
    expect(formatSom(undefined)).toBe('—')
  })

  it('returns the em dash (without suffix) for NaN', () => {
    expect(formatSom(Number.NaN)).toBe('—')
  })
})

describe('formatMoneyShort', () => {
  it('compacts millions with one decimal and an M suffix', () => {
    expect(formatMoneyShort(48200000)).toBe('48.2M')
  })

  it('compacts thousands with one decimal and a k suffix', () => {
    expect(formatMoneyShort(12500)).toBe('12.5k')
  })

  it('leaves values below a thousand untouched', () => {
    expect(formatMoneyShort(500)).toBe('500')
    expect(formatMoneyShort(0)).toBe('0')
  })

  it('compacts large negative values with their sign', () => {
    expect(formatMoneyShort(-2000000)).toBe('-2.0M')
  })

  it('returns the em dash for null', () => {
    expect(formatMoneyShort(null)).toBe('—')
  })

  it('returns the em dash for undefined', () => {
    expect(formatMoneyShort(undefined)).toBe('—')
  })

  it('returns the em dash for NaN', () => {
    expect(formatMoneyShort(Number.NaN)).toBe('—')
  })
})
