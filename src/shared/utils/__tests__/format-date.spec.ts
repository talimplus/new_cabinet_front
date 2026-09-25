import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime, toDateString, parseDate } from '../format-date'

describe('formatDate', () => {
  it('returns the em-dash for null/undefined/empty', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('returns the em-dash for an unparseable value', () => {
    expect(formatDate('not-a-date')).toBe('—')
  })

  it('renders a valid date as dd.MM.yyyy (ru-RU)', () => {
    expect(formatDate('2026-01-05')).toBe('05.01.2026')
  })
})

describe('formatDateTime', () => {
  it('returns the em-dash for null/undefined', () => {
    expect(formatDateTime(null)).toBe('—')
    expect(formatDateTime(undefined)).toBe('—')
  })

  it('returns the em-dash for an unparseable value', () => {
    expect(formatDateTime('not-a-date')).toBe('—')
  })

  it('renders a valid ISO timestamp with day, month, year and hh:mm', () => {
    const rendered = formatDateTime('2026-01-05T14:30:00.000Z')
    const expected = new Date('2026-01-05T14:30:00.000Z').toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    expect(rendered).toBe(expected)
    expect(rendered).toMatch(/^\d{2}\.\d{2}\.\d{4}.*\d{2}:\d{2}$/)
  })
})

describe('toDateString', () => {
  it('returns an empty string for null/undefined/invalid dates', () => {
    expect(toDateString(null)).toBe('')
    expect(toDateString(undefined)).toBe('')
    expect(toDateString(new Date('invalid'))).toBe('')
  })

  it('formats local parts with zero-padding', () => {
    // Local Date (month is 0-based): 2010-05-07
    expect(toDateString(new Date(2010, 4, 7))).toBe('2010-05-07')
  })
})

describe('parseDate', () => {
  it('returns null for null/undefined/empty', () => {
    expect(parseDate(null)).toBeNull()
    expect(parseDate(undefined)).toBeNull()
    expect(parseDate('')).toBeNull()
  })

  it('returns null for an unparseable value', () => {
    expect(parseDate('nope')).toBeNull()
  })

  it('parses a "YYYY-MM-DD" string to local midnight', () => {
    const d = parseDate('2026-01-05')!
    expect(d).not.toBeNull()
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(0)
    expect(d.getDate()).toBe(5)
  })

  it('round-trips through toDateString without a timezone shift', () => {
    expect(toDateString(parseDate('2026-03-15'))).toBe('2026-03-15')
  })
})
