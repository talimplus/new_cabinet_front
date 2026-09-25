import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCheckIn } from '../use-check-in'
import { fetchMyAttendanceToday, checkIn } from '@/shared/api/staff-attendance.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { AttendanceConfidence, AttendanceSource } from '@/shared/enums/attendance-confidence.enum'
import { t } from '@/locales'
import type { StaffAttendance, StaffAttendanceToday, CheckInResult } from '@/shared/interfaces/staff-attendance.interface'

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

/** Stubs `navigator.geolocation.getCurrentPosition` to resolve/reject deterministically. */
function stubGeolocation(mode: 'success' | 'error') {
  const getCurrentPosition = vi.fn(
    (success: PositionCallback, error?: PositionErrorCallback) => {
      if (mode === 'success') {
        success({
          coords: {
            latitude: 41.311,
            longitude: 69.279,
            accuracy: 12.6,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition)
      } else {
        error?.({ code: 1, message: 'denied' } as GeolocationPositionError)
      }
    },
  )
  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition },
    configurable: true,
  })
}

describe('useCheckIn', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'device-uuid') })
    mockedFetch.mockResolvedValue(makeToday())
    mockedCheckIn.mockResolvedValue({ alreadyCheckedIn: false, attendance: makeAttendance() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(navigator, 'geolocation')
  })

  describe('load', () => {
    it('fetches today status into `today`', async () => {
      const body = makeToday({ checkedIn: true, attendance: makeAttendance() })
      mockedFetch.mockResolvedValueOnce(body)

      const c = useCheckIn()
      expect(c.today.value).toBeNull()
      await c.load()

      expect(c.today.value).toEqual(body)
    })
  })

  describe('submit', () => {
    it('includes rounded coords when geolocation resolves a position, and reloads', async () => {
      stubGeolocation('success')
      const c = useCheckIn()

      await c.submit()

      expect(mockedCheckIn).toHaveBeenCalledWith({
        deviceId: 'device-uuid',
        latitude: 41.311,
        longitude: 69.279,
        accuracyMeters: 13, // Math.round(12.6)
      })
      // load() is called once on submit's reload
      expect(mockedFetch).toHaveBeenCalledTimes(1)
    })

    it('submits with no coords when geolocation errors, but still submits', async () => {
      stubGeolocation('error')
      const c = useCheckIn()

      await c.submit()

      expect(mockedCheckIn).toHaveBeenCalledWith({ deviceId: 'device-uuid' })
    })

    it('notifies success on a normal check-in', async () => {
      stubGeolocation('success')
      mockedCheckIn.mockResolvedValueOnce({
        alreadyCheckedIn: false,
        attendance: makeAttendance({ lateMinutes: 0 }),
      })
      const notify = useNotificationStore()

      const c = useCheckIn()
      await c.submit()

      const last = notify.items[notify.items.length - 1]!
      expect(last.type).toBe(NotificationType.SUCCESS)
      expect(last.message).toBe(t('staffAttendance.card.success'))
    })

    it('notifies warning with lateBy message when lateMinutes > 0', async () => {
      stubGeolocation('success')
      mockedCheckIn.mockResolvedValueOnce({
        alreadyCheckedIn: false,
        attendance: makeAttendance({ lateMinutes: 7 }),
      } satisfies CheckInResult)
      const notify = useNotificationStore()

      const c = useCheckIn()
      await c.submit()

      const last = notify.items[notify.items.length - 1]!
      expect(last.type).toBe(NotificationType.WARNING)
      expect(last.message).toBe(t('staffAttendance.card.lateBy', { minutes: 7 }))
    })

    it('notifies info when alreadyCheckedIn is true', async () => {
      stubGeolocation('success')
      mockedCheckIn.mockResolvedValueOnce({
        alreadyCheckedIn: true,
        attendance: makeAttendance(),
      })
      const notify = useNotificationStore()

      const c = useCheckIn()
      await c.submit()

      const last = notify.items[notify.items.length - 1]!
      expect(last.type).toBe(NotificationType.INFO)
      expect(last.message).toBe(t('staffAttendance.card.alreadyCheckedIn'))
    })

    it('reloads today status after a successful submit', async () => {
      stubGeolocation('success')
      const c = useCheckIn()
      mockedFetch.mockResolvedValueOnce(makeToday({ checkedIn: true, attendance: makeAttendance() }))

      await c.submit()

      expect(mockedFetch).toHaveBeenCalledTimes(1)
      expect(c.today.value?.checkedIn).toBe(true)
    })
  })
})
