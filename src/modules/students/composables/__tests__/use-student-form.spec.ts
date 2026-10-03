import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { useStudentForm } from '../use-student-form'
import { StudentStatus } from '../../enums/student-status.enum'
import { StudentPreferredTime } from '../../enums/student-preferred-time.enum'
import { WeekDay } from '@/modules/groups/enums/week-day.enum'
import { DiscountType } from '../../enums/discount-type.enum'
import type { Student } from '../../interfaces/student.interface'

// Stub the select-options composable so reset()'s loadFor() resolves without
// touching the network.
const options = vi.hoisted(() => ({ loadFor: vi.fn(), clear: vi.fn() }))
vi.mock('../use-student-options', async () => {
  const { ref } = await import('vue')
  return {
    useStudentOptions: () => ({
      subjects: ref([]),
      groups: ref([]),
      referrers: ref([]),
      loadFor: options.loadFor,
      clear: options.clear,
    }),
  }
})

describe('useStudentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    options.loadFor.mockResolvedValue(undefined)
  })

  describe('validate()', () => {
    it('records errors and returns false when required fields are blank', async () => {
      const f = useStudentForm(() => 1)
      f.reset(null)
      await flushPromises()

      expect(f.validate()).toBe(false)
      expect(f.errors.firstName).toBeTruthy()
      expect(f.errors.lastName).toBeTruthy()
      expect(f.errors.phone).toBeTruthy()
    })

    it('returns true and leaves no errors when required fields are set', async () => {
      const f = useStudentForm(() => 1)
      f.reset(null)
      await flushPromises()
      f.form.firstName = 'Ali'
      f.form.lastName = 'Valiyev'
      f.form.phone = '998901112233'

      expect(f.validate()).toBe(true)
      expect(Object.keys(f.errors)).toHaveLength(0)
    })
  })

  describe('toPayload()', () => {
    async function ready() {
      const f = useStudentForm(() => 1)
      f.reset(null)
      await flushPromises()
      f.form.firstName = ' Ali '
      f.form.lastName = ' Valiyev '
      f.form.phone = ' 998901112233 '
      return f
    }

    it('trims required strings and drops empty optionals', async () => {
      const f = await ready()
      const payload = f.toPayload()

      expect(payload.firstName).toBe('Ali')
      expect(payload.lastName).toBe('Valiyev')
      expect(payload.phone).toBe('998901112233')
      expect('secondPhone' in payload).toBe(false)
      expect('comment' in payload).toBe(false)
      expect('birthDate' in payload).toBe(false)
    })

    it('converts a birthDate Date to "YYYY-MM-DD" and coerces monthlyFee to a number', async () => {
      const f = await ready()
      f.form.birthDate = new Date(2010, 4, 7) // 2010-05-07 local
      f.form.monthlyFee = '500000'

      const payload = f.toPayload()

      expect(payload.birthDate).toBe('2010-05-07')
      expect(payload.monthlyFee).toBe(500000)
    })

    it('keeps optional scalars when set (preferredTime, days, centerId)', async () => {
      const f = await ready()
      f.form.preferredTime = StudentPreferredTime.MORNING
      f.form.preferredDays = [WeekDay.MONDAY, WeekDay.FRIDAY]

      const payload = f.toPayload()

      expect(payload.preferredTime).toBe(StudentPreferredTime.MORNING)
      expect(payload.preferredDays).toEqual([WeekDay.MONDAY, WeekDay.FRIDAY])
      expect(payload.centerId).toBe(1)
    })

    it('is mutually exclusive on identity: jshshir omits passport fields', async () => {
      const f = await ready()
      f.form.jshshir = '12345678901234'
      f.form.passportSeries = 'AA'
      f.form.passportNumber = '1234567'

      const payload = f.toPayload()

      expect(payload.jshshir).toBe('12345678901234')
      expect('passportSeries' in payload).toBe(false)
      expect('passportNumber' in payload).toBe(false)
    })

    it('sends passport fields when jshshir is blank', async () => {
      const f = await ready()
      f.form.passportSeries = 'AA'
      f.form.passportNumber = '1234567'

      const payload = f.toPayload()

      expect(payload.passportSeries).toBe('AA')
      expect(payload.passportNumber).toBe('1234567')
      expect('jshshir' in payload).toBe(false)
    })

    it('simple percent discount emits discountPercent (and zeroes the amount)', async () => {
      const f = await ready()
      f.form.usePeriods = false
      f.form.discountType = DiscountType.PERCENT
      f.form.discountValue = '10'
      f.form.discountReason = 'Sodiq mijoz'

      const payload = f.toPayload()

      expect(payload.discountPercent).toBe(10)
      expect(payload.discountAmount).toBe(0)
      expect(payload.discountReason).toBe('Sodiq mijoz')
      expect('discountPeriods' in payload).toBe(false)
    })

    it('simple amount discount emits discountAmount (and zeroes the percent)', async () => {
      const f = await ready()
      f.form.discountType = DiscountType.AMOUNT
      f.form.discountValue = '20000'

      const payload = f.toPayload()

      expect(payload.discountAmount).toBe(20000)
      expect(payload.discountPercent).toBe(0)
    })

    it('omits the simple discount when no value is entered', async () => {
      const f = await ready()
      f.form.discountType = DiscountType.AMOUNT
      f.form.discountValue = ''

      const payload = f.toPayload()

      expect('discountPercent' in payload).toBe(false)
      expect('discountAmount' in payload).toBe(false)
    })

    it('period mode emits percent OR amount per row, with the group, and omits the simple fields', async () => {
      const f = await ready()
      f.form.usePeriods = true
      f.form.discountValue = '10'
      f.form.discountReason = 'ignored'
      f.form.discountPeriods = [
        { type: DiscountType.PERCENT, value: '10', groupId: null, fromMonth: '2026-01', toMonth: '2026-06', reason: ' Aksiya ' },
        { type: DiscountType.AMOUNT, value: '20000', groupId: 12, fromMonth: '2026-07', toMonth: '', reason: 'Ikki fan' },
        { type: DiscountType.PERCENT, value: '', groupId: null, fromMonth: '2026-02', toMonth: '', reason: '' }, // no value
        { type: DiscountType.AMOUNT, value: '5000', groupId: null, fromMonth: '', toMonth: '', reason: '' }, // no fromMonth
      ]

      const payload = f.toPayload()

      expect(payload.discountPeriods).toEqual([
        { percent: 10, fromMonth: '2026-01', toMonth: '2026-06', reason: 'Aksiya' },
        { amount: 20000, groupId: 12, fromMonth: '2026-07', reason: 'Ikki fan' },
      ])
      expect('discountPercent' in payload).toBe(false)
      expect('discountAmount' in payload).toBe(false)
      expect('discountReason' in payload).toBe(false)
    })
  })

  describe('reset()', () => {
    it('loads the selects on every open, even when the center is unchanged', async () => {
      const f = useStudentForm(() => 7)
      f.reset(null)
      f.reset(null)
      await flushPromises()

      expect(options.loadFor).toHaveBeenCalledTimes(2)
      expect(options.loadFor).toHaveBeenCalledWith(7)
    })

    it('loads the selects for the edited student\'s center', async () => {
      const f = useStudentForm(() => 7)
      f.reset({ id: 1, firstName: 'A', lastName: 'B', phone: '1', status: StudentStatus.ACTIVE, centerId: 9 })
      await flushPromises()

      expect(options.loadFor).toHaveBeenCalledWith(9)
    })

    it('clears the selects when there is no center to load for', async () => {
      const f = useStudentForm(() => null)
      f.reset(null)
      await flushPromises()

      expect(options.loadFor).not.toHaveBeenCalled()
      expect(options.clear).toHaveBeenCalled()
    })

    it('populates the form from a Student', async () => {
      const f = useStudentForm(() => 7)
      const student: Student = {
        id: 5,
        firstName: 'Ali',
        lastName: 'Valiyev',
        phone: '998901112233',
        secondPhone: '998900000000',
        birthDate: '2010-05-07',
        monthlyFee: '500000',
        centerId: 7,
        subjectId: 3,
        groupIds: [1, 2],
        jshshir: '12345678901234',
        status: StudentStatus.ACTIVE,
      }
      f.reset(student)
      await flushPromises()

      expect(f.form.firstName).toBe('Ali')
      expect(f.form.lastName).toBe('Valiyev')
      expect(f.form.phone).toBe('998901112233')
      expect(f.form.secondPhone).toBe('998900000000')
      expect(f.form.birthDate?.getFullYear()).toBe(2010)
      expect(f.form.birthDate?.getMonth()).toBe(4)
      expect(f.form.birthDate?.getDate()).toBe(7)
      expect(f.form.monthlyFee).toBe('500000')
      expect(f.form.centerId).toBe(7)
      expect(f.form.subjectId).toBe(3)
      expect(f.form.groupIds).toEqual([1, 2])
      expect(f.form.jshshir).toBe('12345678901234')
    })

    it('reads an amount discount back as the "amount" type', async () => {
      const f = useStudentForm(() => 7)
      f.reset({
        id: 2, firstName: 'A', lastName: 'B', phone: '1', status: StudentStatus.ACTIVE, centerId: 7,
        discountPercent: '0', discountAmount: '20000', discountReason: 'Ikki fan',
      })
      await flushPromises()

      expect(f.form.usePeriods).toBe(false)
      expect(f.form.discountType).toBe(DiscountType.AMOUNT)
      expect(f.form.discountValue).toBe(20000)
      expect(f.form.discountReason).toBe('Ikki fan')
    })

    it('reads periods back with their type and group', async () => {
      const f = useStudentForm(() => 7)
      f.reset({
        id: 3, firstName: 'A', lastName: 'B', phone: '1', status: StudentStatus.ACTIVE, centerId: 7,
        discountPeriods: [
          { id: 1, percent: 0, amount: 20000, groupId: 12, fromMonth: '2026-07-01', toMonth: '2026-08-01', reason: 'x' },
          { id: 2, percent: 10, amount: 0, groupId: null, fromMonth: '2026-06-01', toMonth: null },
        ],
      })
      await flushPromises()

      expect(f.form.usePeriods).toBe(true)
      expect(f.form.discountPeriods).toEqual([
        { type: DiscountType.AMOUNT, value: 20000, groupId: 12, fromMonth: '2026-07', toMonth: '2026-08', reason: 'x' },
        { type: DiscountType.PERCENT, value: 10, groupId: null, fromMonth: '2026-06', toMonth: '', reason: '' },
      ])
    })

    it('blanks the form on reset(null)', async () => {
      const f = useStudentForm(() => 4)
      f.reset({
        id: 1,
        firstName: 'Ali',
        lastName: 'Valiyev',
        phone: '998901112233',
        status: StudentStatus.NEW,
      })
      await flushPromises()

      f.reset(null)
      await flushPromises()

      expect(f.form.firstName).toBe('')
      expect(f.form.lastName).toBe('')
      expect(f.form.phone).toBe('')
      expect(f.form.birthDate).toBeNull()
      expect(f.form.groupIds).toEqual([])
      expect(f.form.centerId).toBe(4) // defaultCenterId getter
    })
  })
})
