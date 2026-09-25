import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { useLeadForm } from '../use-lead-form'
import { WeekDay } from '@/modules/groups/enums/week-day.enum'
import { LeadStatus } from '../../enums/lead-status.enum'
import { t } from '@/locales'
import type { Lead } from '../../interfaces/lead.interface'

vi.mock('@/modules/groups/api/groups.api', () => ({
  fetchAllGroups: vi.fn().mockResolvedValue([]),
}))
vi.mock('@/shared/permissions/optional-request', () => ({
  optionalRequest: vi.fn().mockResolvedValue([]),
}))

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 1,
    phone: '998901112233',
    status: LeadStatus.NEW,
    ...overrides,
  }
}

describe('useLeadForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('toPayload()', () => {
    it('only includes phone (trimmed) when nothing else is set', async () => {
      const { form, toPayload } = useLeadForm(() => null)
      form.phone = '  +998901112233 '
      await flushPromises()

      const payload = toPayload()

      expect(payload).toEqual({ phone: '+998901112233' })
      expect(payload).not.toHaveProperty('firstName')
      expect(payload).not.toHaveProperty('secondPhone')
      expect(payload).not.toHaveProperty('comment')
      expect(payload).not.toHaveProperty('preferredDays')
      expect(payload).not.toHaveProperty('groupIds')
      expect(payload).not.toHaveProperty('monthlyFee')
      expect(payload).not.toHaveProperty('discountPercent')
    })

    it('includes populated fields with the right types', async () => {
      const { form, toPayload } = useLeadForm(() => null)
      form.phone = '998901112233'
      form.firstName = ' Ali '
      form.lastName = ' Valiyev '
      form.secondPhone = ' 998907778899 '
      form.monthlyFee = '500000'
      form.discountPercent = '10'
      form.discountReason = ' Chegirma sababi '
      form.preferredDays = [WeekDay.MONDAY]
      form.groupIds = [5]
      await flushPromises()

      const payload = toPayload()

      expect(payload.firstName).toBe('Ali')
      expect(payload.lastName).toBe('Valiyev')
      expect(payload.secondPhone).toBe('998907778899')
      expect(payload.monthlyFee).toBe(500000)
      expect(payload.discountPercent).toBe(10)
      expect(payload.discountReason).toBe('Chegirma sababi')
      expect(payload.preferredDays).toEqual([WeekDay.MONDAY])
      expect(payload.groupIds).toEqual([5])
    })

    it('sends jshshir and omits passport fields when jshshir is set', async () => {
      const { form, toPayload } = useLeadForm(() => null)
      form.phone = '998901112233'
      form.jshshir = ' 12345678901234 '
      form.passportSeries = ' AB '
      form.passportNumber = ' 1234567 '
      await flushPromises()

      const payload = toPayload()

      expect(payload.jshshir).toBe('12345678901234')
      expect(payload).not.toHaveProperty('passportSeries')
      expect(payload).not.toHaveProperty('passportNumber')
    })

    it('sends passport fields when jshshir is empty', async () => {
      const { form, toPayload } = useLeadForm(() => null)
      form.phone = '998901112233'
      form.jshshir = '   '
      form.passportSeries = ' AB '
      form.passportNumber = ' 1234567 '
      await flushPromises()

      const payload = toPayload()

      expect(payload.passportSeries).toBe('AB')
      expect(payload.passportNumber).toBe('1234567')
      expect(payload).not.toHaveProperty('jshshir')
    })
  })

  describe('toTransferPayload()', () => {
    it('always carries an empty discountPeriods array', async () => {
      const { form, toTransferPayload } = useLeadForm(() => null)
      form.phone = '998901112233'
      await flushPromises()

      expect(toTransferPayload().discountPeriods).toEqual([])
    })

    it('forces status NEW', async () => {
      const { form, toTransferPayload } = useLeadForm(() => null)
      form.phone = '998901112233'
      await flushPromises()

      expect(toTransferPayload().status).toBe(LeadStatus.NEW)
    })

    it('omits followUpDate even when set on the form', async () => {
      const { form, toTransferPayload } = useLeadForm(() => null)
      form.phone = '998901112233'
      form.followUpDate = new Date('2026-01-15')
      await flushPromises()

      expect(toTransferPayload()).not.toHaveProperty('followUpDate')
    })

    it('always has groupIds as an array, empty when none selected', async () => {
      const { form, toTransferPayload } = useLeadForm(() => null)
      form.phone = '998901112233'
      await flushPromises()

      expect(toTransferPayload().groupIds).toEqual([])
    })

    it('carries trimmed firstName/lastName/phone', async () => {
      const { form, toTransferPayload } = useLeadForm(() => null)
      form.phone = ' 998901112233 '
      form.firstName = ' Ali '
      form.lastName = ' Valiyev '
      await flushPromises()

      const payload = toTransferPayload()

      expect(payload.firstName).toBe('Ali')
      expect(payload.lastName).toBe('Valiyev')
      expect(payload.phone).toBe('998901112233')
    })
  })

  describe('validate()', () => {
    it('fails with an empty/whitespace phone and sets errors.phone', async () => {
      const { form, errors, validate } = useLeadForm(() => null)
      form.phone = '   '
      await flushPromises()

      expect(validate()).toBe(false)
      expect(errors.phone).toBe(t('leads.validation.phone'))
    })

    it('passes when phone is set', async () => {
      const { form, errors, validate } = useLeadForm(() => null)
      form.phone = '998901112233'
      await flushPromises()

      expect(validate()).toBe(true)
      expect(errors.phone).toBeUndefined()
    })
  })

  describe('reset()', () => {
    it('blanks the form when editing is null', async () => {
      const { form, reset } = useLeadForm(() => null)
      form.phone = '998901112233'
      form.firstName = 'Ali'
      await flushPromises()

      reset(null)

      expect(form.phone).toBe('')
      expect(form.firstName).toBe('')
    })

    it('copies fields from the given lead onto the form', async () => {
      const { form, reset } = useLeadForm(() => null)
      const lead = makeLead({
        firstName: 'Ali',
        lastName: 'Valiyev',
        phone: '998901112233',
        discountPercent: 15,
        jshshir: '12345678901234',
        groupIds: [3, 4],
        preferredDays: [WeekDay.TUESDAY],
      })

      reset(lead)
      await flushPromises()

      expect(form.firstName).toBe('Ali')
      expect(form.lastName).toBe('Valiyev')
      expect(form.phone).toBe('998901112233')
      expect(form.discountPercent).toBe(15)
      expect(form.jshshir).toBe('12345678901234')
      expect(form.groupIds).toEqual([3, 4])
      expect(form.preferredDays).toEqual([WeekDay.TUESDAY])
    })
  })
})
