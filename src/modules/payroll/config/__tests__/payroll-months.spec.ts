import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { earliestOpening, buildYearOptions, buildMonthOptions, PAYROLL_MONTHS } from '../payroll-months'
import type { Center } from '@/modules/centers/interfaces/center.interface'

function makeCenter(overrides: Partial<Center> = {}): Center {
  return { id: 1, name: 'Main', ...overrides }
}

describe('earliestOpening', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-24T00:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('uses the active center createdAt when one is selected', () => {
    const centers = [
      makeCenter({ id: 1, createdAt: '2024-03-01' }),
      makeCenter({ id: 2, createdAt: '2022-01-01' }),
    ]
    const result = earliestOpening(centers, 1)
    expect(result.toISOString().slice(0, 10)).toBe('2024-03-01')
  })

  it('takes the earliest createdAt across all centers when none is active', () => {
    const centers = [
      makeCenter({ id: 1, createdAt: '2024-03-01' }),
      makeCenter({ id: 2, createdAt: '2022-01-01' }),
    ]
    const result = earliestOpening(centers, null)
    expect(result.toISOString().slice(0, 10)).toBe('2022-01-01')
  })

  it('falls back to roughly a year ago with no centers', () => {
    const result = earliestOpening([], null)
    expect(result.getFullYear()).toBe(2025)
    expect(result.getMonth()).toBe(8) // September, 0-indexed
  })

  it('falls back to roughly a year ago when no createdAt is parsable', () => {
    const centers = [makeCenter({ id: 1, createdAt: undefined }), makeCenter({ id: 2, createdAt: 'not-a-date' })]
    const result = earliestOpening(centers, null)
    expect(result.getFullYear()).toBe(2025)
    expect(result.getMonth()).toBe(8)
  })
})

describe('buildYearOptions', () => {
  const today = new Date('2026-09-24T00:00:00Z')

  it('lists years from the opening year to the current year, newest first', () => {
    expect(buildYearOptions(new Date('2023-05-01'), today)).toEqual([2026, 2025, 2024, 2023])
  })

  it('returns a single year when the center opened this year', () => {
    expect(buildYearOptions(new Date('2026-02-01'), today)).toEqual([2026])
  })
})

describe('buildMonthOptions', () => {
  const today = new Date('2026-09-24T00:00:00Z') // September = index 8
  const opened = new Date('2024-05-01T00:00:00Z') // May = index 4

  it('starts at the opening month in the opening year', () => {
    const options = buildMonthOptions(2024, opened, today)
    expect(options[0]).toEqual(PAYROLL_MONTHS[4]) // May
    expect(options[options.length - 1]).toEqual(PAYROLL_MONTHS[11]) // December
    expect(options).toHaveLength(8)
  })

  it('stops at the current month (inclusive) in the current year', () => {
    const options = buildMonthOptions(2026, opened, today)
    expect(options[0]).toEqual(PAYROLL_MONTHS[0]) // January
    const last = options[options.length - 1]
    expect(last).toEqual(PAYROLL_MONTHS[8]) // September
    expect(options).toHaveLength(9)
  })

  it('returns all 12 months for a year strictly between opening and today', () => {
    const options = buildMonthOptions(2025, opened, today)
    expect(options).toHaveLength(12)
    expect(options[0]).toEqual(PAYROLL_MONTHS[0])
    expect(options[options.length - 1]).toEqual(PAYROLL_MONTHS[11])
  })

  // A year outside the center's lifetime has no payroll at all — without the
  // guard this fell through to "all 12 months".
  it('returns an empty list for a year before the opening', () => {
    expect(buildMonthOptions(2023, opened, today)).toEqual([])
  })

  it('returns an empty list for a year after today', () => {
    expect(buildMonthOptions(today.getFullYear() + 1, opened, today)).toEqual([])
  })
})
