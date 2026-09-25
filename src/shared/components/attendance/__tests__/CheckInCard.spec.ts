import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CheckInCard from '../CheckInCard.vue'
import { fetchMyAttendanceToday, checkIn } from '@/shared/api/staff-attendance.api'
import { AttendanceConfidence, AttendanceSource } from '@/shared/enums/attendance-confidence.enum'
import { AttendanceFlag, ATTENDANCE_FLAG_LABEL_KEYS } from '@/shared/enums/attendance-flag.enum'
import { t } from '@/locales'
import type { StaffAttendance, StaffAttendanceToday } from '@/shared/interfaces/staff-attendance.interface'

vi.mock('@/shared/api/staff-attendance.api', () => ({
  fetchMyAttendanceToday: vi.fn(),
  checkIn: vi.fn(),
}))

const mockedFetch = vi.mocked(fetchMyAttendanceToday)
const mockedCheckIn = vi.mocked(checkIn)

function makeAttendance(overrides: Partial<StaffAttendance> = {}): StaffAttendance {
  return {
    id: 1,
    userId: 5,
    centerId: 2,
    workDate: '2026-09-24',
    checkInAt: '2026-09-24T04:05:00.000Z',
    firstLessonAt: '2026-09-24T04:00:00.000Z',
    lateMinutes: 0,
    source: AttendanceSource.SELF,
    confidence: AttendanceConfidence.HIGH,
    distanceMeters: 12,
    geoMatched: true,
    ipMatched: true,
    flags: [],
    confirmedByUserId: null,
    confirmedAt: null,
    note: null,
    ...overrides,
  }
}

function makeToday(overrides: Partial<StaffAttendanceToday> = {}): StaffAttendanceToday {
  return {
    date: '2026-09-24',
    checkedIn: false,
    attendance: null,
    firstLessonAt: null,
    lessonsToday: 2,
    centerConfigured: true,
    ...overrides,
  }
}

describe('CheckInCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedCheckIn.mockResolvedValue({ alreadyCheckedIn: false, attendance: makeAttendance() })
  })

  describe('not checked in', () => {
    it('renders the check-in button and the geo notice', async () => {
      mockedFetch.mockResolvedValueOnce(makeToday())
      const wrapper = mount(CheckInCard)
      await flushPromises()

      expect(wrapper.text()).toContain(t('staffAttendance.card.notCheckedIn'))
      expect(wrapper.text()).toContain(t('staffAttendance.card.checkInButton'))
      expect(wrapper.text()).toContain(t('staffAttendance.card.geoNotice'))
    })

    it('clicking the button submits a check-in', async () => {
      mockedFetch.mockResolvedValueOnce(makeToday())
      const wrapper = mount(CheckInCard)
      await flushPromises()

      await wrapper.get('button').trigger('click')
      await flushPromises()

      expect(mockedCheckIn).toHaveBeenCalledTimes(1)
    })
  })

  describe('checked in', () => {
    it('renders the checked-in message and the arrival time', async () => {
      mockedFetch.mockResolvedValueOnce(
        makeToday({ checkedIn: true, attendance: makeAttendance({ lateMinutes: 0 }) }),
      )
      const wrapper = mount(CheckInCard)
      await flushPromises()

      expect(wrapper.text()).toContain(t('staffAttendance.card.checkedIn'))
      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('shows the late note when lateMinutes > 0', async () => {
      mockedFetch.mockResolvedValueOnce(
        makeToday({ checkedIn: true, attendance: makeAttendance({ lateMinutes: 7 }) }),
      )
      const wrapper = mount(CheckInCard)
      await flushPromises()

      expect(wrapper.text()).toContain(t('staffAttendance.card.lateBy', { minutes: 7 }))
    })

    it('does not show a late note when on time', async () => {
      mockedFetch.mockResolvedValueOnce(
        makeToday({ checkedIn: true, attendance: makeAttendance({ lateMinutes: 0 }) }),
      )
      const wrapper = mount(CheckInCard)
      await flushPromises()

      expect(wrapper.text()).not.toContain(t('staffAttendance.card.lateBy', { minutes: 0 }))
    })

    it('renders warning flags but hides no_lesson_today and center_not_configured', async () => {
      mockedFetch.mockResolvedValueOnce(
        makeToday({
          checkedIn: true,
          attendance: makeAttendance({
            flags: [
              AttendanceFlag.NO_GEO,
              AttendanceFlag.LOW_GPS_ACCURACY,
              AttendanceFlag.NO_LESSON_TODAY,
              AttendanceFlag.CENTER_NOT_CONFIGURED,
            ],
          }),
        }),
      )
      const wrapper = mount(CheckInCard)
      await flushPromises()

      expect(wrapper.text()).toContain(t(ATTENDANCE_FLAG_LABEL_KEYS[AttendanceFlag.NO_GEO]))
      expect(wrapper.text()).toContain(t(ATTENDANCE_FLAG_LABEL_KEYS[AttendanceFlag.LOW_GPS_ACCURACY]))
      expect(wrapper.text()).not.toContain(t(ATTENDANCE_FLAG_LABEL_KEYS[AttendanceFlag.NO_LESSON_TODAY]))
      expect(wrapper.text()).not.toContain(
        t(ATTENDANCE_FLAG_LABEL_KEYS[AttendanceFlag.CENTER_NOT_CONFIGURED]),
      )
    })
  })
})
