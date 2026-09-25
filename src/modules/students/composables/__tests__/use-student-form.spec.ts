import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { useStudentForm } from '../use-student-form'
import { StudentStatus } from '../../enums/student-status.enum'
import { StudentPreferredTime } from '../../enums/student-preferred-time.enum'
import { WeekDay } from '@/modules/groups/enums/week-day.enum'
import type { Student } from '../../interfaces/student.interface'

// Stub the select-options composable so the centerId watcher's loadFor()
// resolves without touching the network.
vi.mock('../use-student-options', async () => {
  const { ref } = await import('vue')
  return {
    useStudentOptions: () => ({
      subjects: ref([]),
      groups: ref([]),
      referrers: ref([]),
      loadFor: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn(),
    }),
  }
})

describe('useStudentForm', () => {
  beforeEach(() => vi.clearAllMocks())

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

    it('simple discount mode emits discountPercent/discountReason', async () => {
      const f = await ready()
      f.form.usePeriods = false
      f.form.discountPercent = '10'
      f.form.discountReason = 'Sodiq mijoz'

      const payload = f.toPayload()

      expect(payload.discountPercent).toBe(10)
      expect(payload.discountReason).toBe('Sodiq mijoz')
      expect('discountPeriods' in payload).toBe(false)
    })

    it('period mode emits discountPeriods filtered to valid rows and omits the simple fields', async () => {
      const f = await ready()
      f.form.usePeriods = true
      f.form.discountPercent = '10'
      f.form.discountReason = 'ignored'
      f.form.discountPeriods = [
        { percent: '20', fromMonth: '2026-01', toMonth: '2026-06', reason: ' Aksiya ' },
        { percent: '', fromMonth: '2026-02', toMonth: '', reason: '' }, // no percent
        { percent: '30', fromMonth: '', toMonth: '', reason: '' }, // no fromMonth
      ]

      const payload = f.toPayload()

      expect(payload.discountPeriods).toEqual([
        { percent: 20, fromMonth: '2026-01', toMonth: '2026-06', reason: 'Aksiya' },
      ])
      expect('discountPercent' in payload).toBe(false)
      expect('discountReason' in payload).toBe(false)
    })
  })

  describe('reset()', () => {
    it('populates the form from a Student', async () => {
      // Default center matches the student's so the centerId watcher does not
      // fire and wipe the scoped selects (subjectId/groupIds).
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
