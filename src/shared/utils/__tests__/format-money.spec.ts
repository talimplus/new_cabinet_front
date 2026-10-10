import { describe, it, expect } from 'vitest'
import {
  formatMoney, formatSom, formatMoneyShort,
  cleanAmountText, groupAmountText, amountTextToValue, amountToText,
} from '../format-money'
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

describe('amount field text', () => {
  it.each([
    ['100000', '100000'],
    ['100 000', '100000'],
    ['1 000 000 so‘m', '1000000'],
    ['007', '7'],
    ['0', '0'],
    ['', ''],
    ['12,5', '12.5'],
    ['12.345', '12.34'],
    ['1.2.3', '1.23'],
    ['.5', '0.5'],
    ['-300', '300'],
  ])('cleanAmountText(%j) → %j', (raw, clean) => {
    expect(cleanAmountText(raw)).toBe(clean)
  })

  it('groups thousands with spaces, keeping a decimal part as typed', () => {
    expect(groupAmountText('10000')).toBe('10 000')
    expect(groupAmountText('100000')).toBe('100 000')
    expect(groupAmountText('1000000.5')).toBe('1 000 000.5')
    expect(groupAmountText('1000.')).toBe('1 000.')
    expect(groupAmountText('999')).toBe('999')
  })

  it('converts the text to a number, empty to ""', () => {
    expect(amountTextToValue('100000')).toBe(100000)
    expect(amountTextToValue('12.5')).toBe(12.5)
    expect(amountTextToValue('')).toBe('')
  })

  it('reads a stored amount, including the backend numeric strings', () => {
    expect(amountToText(500000)).toBe('500 000')
    expect(amountToText('500000.00')).toBe('500 000')
    expect(amountToText('1234.5')).toBe('1 234.5')
    expect(amountToText(null)).toBe('')
    expect(amountToText('')).toBe('')
    expect(amountToText('abc')).toBe('')
  })
})
