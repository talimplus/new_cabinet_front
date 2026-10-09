import { describe, it, expect, vi, afterEach } from 'vitest'
import { toCandidateForm, useCandidateSchema, MIN_BIRTH_YEAR } from '../use-candidate-schema'
import { t } from '@/locales'

const valid = {
  centerId: 1,
  lastName: 'Valiyev',
  firstName: 'Ali',
  phone: '+998977522014',
  experience: '3 yil',
  birthYear: 1995,
  subjectId: 2,
  address: 'Toshkent',
  comment: '',
}

async function errorsOf(values: Record<string, unknown>): Promise<Record<string, string>> {
  const { errors } = await useCandidateSchema().value.parse(values)
  return Object.fromEntries(errors.map((e) => [e.path, e.errors[0] ?? '']))
}

describe('toCandidateForm', () => {
  it('trims the required strings and keeps the rest', () => {
    const result = toCandidateForm({
      ...valid,
      lastName: '  Valiyev ',
      firstName: ' Ali ',
      experience: ' 3 yil  ',
      address: '  Toshkent ',
      comment: ' izoh ',
    })

    expect(result).toEqual({
      centerId: 1,
      lastName: 'Valiyev',
      firstName: 'Ali',
      phone: '+998977522014',
      experience: '3 yil',
      birthYear: 1995,
      subjectId: 2,
      address: 'Toshkent',
      comment: 'izoh',
    })
  })

  it('turns empty / whitespace / missing address and comment into null', () => {
    expect(toCandidateForm({ ...valid, address: '   ', comment: '' })).toMatchObject({ address: null, comment: null })
    const { address: _a, comment: _c, ...rest } = valid
    expect(toCandidateForm(rest)).toMatchObject({ address: null, comment: null })
  })

  it('turns a missing or null subjectId into null', () => {
    const { subjectId: _s, ...rest } = valid
    expect(toCandidateForm(rest).subjectId).toBeNull()
    expect(toCandidateForm({ ...valid, subjectId: null }).subjectId).toBeNull()
  })
})

describe('useCandidateSchema', () => {
  afterEach(() => vi.useRealTimers())

  it('accepts a valid candidate', async () => {
    const { value, errors } = await useCandidateSchema().value.parse(valid)
    expect(errors).toEqual([])
    expect(value).toMatchObject({ lastName: 'Valiyev', birthYear: 1995 })
  })

  it('accepts a candidate without the optional fields', async () => {
    const { subjectId: _s, address: _a, comment: _c, ...rest } = valid
    expect(await errorsOf({ ...rest, subjectId: null })).toEqual({})
  })

  it('rejects empty / whitespace-only required text fields', async () => {
    const errors = await errorsOf({ ...valid, lastName: '', firstName: '   ', experience: '' })
    expect(errors.lastName).toBe(t('candidates.validation.lastName'))
    expect(errors.firstName).toBe(t('candidates.validation.firstName'))
    expect(errors.experience).toBe(t('candidates.validation.experience'))
  })

  it('rejects a missing center', async () => {
    const { centerId: _c, ...rest } = valid
    expect((await errorsOf(rest)).centerId).toBe(t('common.centerRequired'))
  })

  it.each(['+99897752201', '977522014', '', '+9989775220145'])('rejects the incomplete phone %j', async (phone) => {
    expect((await errorsOf({ ...valid, phone })).phone).toBe(t('candidates.validation.phone'))
  })

  it('rejects a missing birth year', async () => {
    const { birthYear: _b, ...rest } = valid
    expect((await errorsOf(rest)).birthYear).toBe(t('candidates.validation.birthYear'))
  })

  it('rejects a fractional birth year', async () => {
    expect((await errorsOf({ ...valid, birthYear: 1995.5 })).birthYear).toBe(t('candidates.validation.birthYear'))
  })

  it('rejects a birth year outside MIN_BIRTH_YEAR … current year', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 9))
    const range = t('candidates.validation.birthYearRange', { min: MIN_BIRTH_YEAR, max: 2026 })

    expect((await errorsOf({ ...valid, birthYear: MIN_BIRTH_YEAR - 1 })).birthYear).toBe(range)
    expect((await errorsOf({ ...valid, birthYear: 2027 })).birthYear).toBe(range)
    expect(await errorsOf({ ...valid, birthYear: MIN_BIRTH_YEAR })).toEqual({})
    expect(await errorsOf({ ...valid, birthYear: 2026 })).toEqual({})
  })
})
