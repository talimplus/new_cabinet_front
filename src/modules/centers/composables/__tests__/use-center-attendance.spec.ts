import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCenterAttendance } from '../use-center-attendance'
import { captureCenterIp } from '../../api/centers.api'
import { useNotificationStore } from '@/stores/notification.store'
import type { Center } from '../../interfaces/center.interface'

vi.mock('../../api/centers.api', () => ({
  captureCenterIp: vi.fn(),
}))

vi.mock('@/stores/notification.store', () => ({
  useNotificationStore: vi.fn(),
}))

const mockedCaptureCenterIp = vi.mocked(captureCenterIp)
const mockedUseNotificationStore = vi.mocked(useNotificationStore)

function makeCenter(overrides: Partial<Center> = {}): Center {
  return { id: 1, name: 'Markaz 1', ...overrides }
}

describe('useCenterAttendance', () => {
  let notify: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>; warning: ReturnType<typeof vi.fn>; info: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    vi.clearAllMocks()
    notify = { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }
    // @ts-expect-error partial store mock is fine for this composable's needs
    mockedUseNotificationStore.mockReturnValue(notify)
  })

  describe('applyFrom()', () => {
    it('copies latitude/longitude/checkInRadiusMeters/publicIp from a Center', () => {
      const s = useCenterAttendance()
      const center = makeCenter({
        latitude: 41.311081,
        longitude: 69.240563,
        checkInRadiusMeters: 200,
        publicIp: '84.54.72.10',
      })

      s.applyFrom(center)

      expect(s.form.latitude).toBe(41.311081)
      expect(s.form.longitude).toBe(69.240563)
      expect(s.form.checkInRadiusMeters).toBe(200)
      expect(s.form.publicIp).toBe('84.54.72.10')
    })

    it('falls back to blank/default values when the Center fields are null', () => {
      const s = useCenterAttendance()
      const center = makeCenter({
        latitude: null,
        longitude: null,
        checkInRadiusMeters: null,
        publicIp: null,
      })

      s.applyFrom(center)

      expect(s.form.latitude).toBe('')
      expect(s.form.longitude).toBe('')
      expect(s.form.checkInRadiusMeters).toBe(150)
      expect(s.form.publicIp).toBe('')
    })

    it('falls back to blank/default values when the Center fields are undefined', () => {
      const s = useCenterAttendance()

      s.applyFrom(makeCenter())

      expect(s.form.latitude).toBe('')
      expect(s.form.longitude).toBe('')
      expect(s.form.checkInRadiusMeters).toBe(150)
      expect(s.form.publicIp).toBe('')
    })
  })

  describe('toPayload()', () => {
    it('turns empty coord fields into null, not 0', () => {
      const s = useCenterAttendance()
      s.form.latitude = ''
      s.form.longitude = ''

      const payload = s.toPayload()

      expect(payload.latitude).toBeNull()
      expect(payload.longitude).toBeNull()
    })

    // The radius has no "clear" on the backend: a null would be stored as 0 m.
    it('omits a blank radius entirely instead of sending null', () => {
      const s = useCenterAttendance()
      s.form.checkInRadiusMeters = ''

      const payload = s.toPayload()

      expect('checkInRadiusMeters' in payload).toBe(false)
    })

    it('passes numeric coords through as numbers', () => {
      const s = useCenterAttendance()
      s.form.latitude = 41.311081
      s.form.longitude = 69.240563
      s.form.checkInRadiusMeters = 250

      const payload = s.toPayload()

      expect(payload.latitude).toBe(41.311081)
      expect(payload.longitude).toBe(69.240563)
      expect(payload.checkInRadiusMeters).toBe(250)
    })

    it('trims a set publicIp', () => {
      const s = useCenterAttendance()
      s.form.publicIp = '  84.54.72.10  '

      expect(s.toPayload().publicIp).toBe('84.54.72.10')
    })

    it('turns an empty or whitespace-only publicIp into null', () => {
      const s = useCenterAttendance()

      s.form.publicIp = ''
      expect(s.toPayload().publicIp).toBeNull()

      s.form.publicIp = '   '
      expect(s.toPayload().publicIp).toBeNull()
    })
  })

  describe('useCurrentPosition()', () => {
    it('rounds the browser coords to 7 decimals and notifies success', () => {
      Object.defineProperty(globalThis.navigator, 'geolocation', {
        value: {
          getCurrentPosition: vi.fn((success) =>
            success({ coords: { latitude: 41.311081234, longitude: 69.240562987 } }),
          ),
        },
        configurable: true,
      })

      const s = useCenterAttendance()
      s.useCurrentPosition()

      expect(s.form.latitude).toBe(41.3110812)
      expect(s.form.longitude).toBe(69.2405630)
      expect(s.geoLoading.value).toBe(false)
      expect(notify.success).toHaveBeenCalledTimes(1)
      expect(notify.error).not.toHaveBeenCalled()
    })

    it('notifies an error and clears geoLoading when the user denies location', () => {
      Object.defineProperty(globalThis.navigator, 'geolocation', {
        value: {
          getCurrentPosition: vi.fn((_success, error) => error(new Error('denied'))),
        },
        configurable: true,
      })

      const s = useCenterAttendance()
      s.useCurrentPosition()

      expect(s.geoLoading.value).toBe(false)
      expect(notify.error).toHaveBeenCalledTimes(1)
      expect(notify.success).not.toHaveBeenCalled()
    })

    it('notifies an error and never calls getCurrentPosition when geolocation is unsupported', () => {
      Object.defineProperty(globalThis.navigator, 'geolocation', {
        value: undefined,
        configurable: true,
      })

      const s = useCenterAttendance()
      s.useCurrentPosition()

      expect(s.geoLoading.value).toBe(false)
      expect(notify.error).toHaveBeenCalledTimes(1)
    })
  })

  describe('captureIp()', () => {
    it('sets the publicIp from the response, notifies success, and clears ipLoading', async () => {
      mockedCaptureCenterIp.mockResolvedValueOnce({ publicIp: '84.54.72.10' })
      const s = useCenterAttendance()

      const promise = s.captureIp(4)
      expect(s.ipLoading.value).toBe(true)
      await promise

      expect(mockedCaptureCenterIp).toHaveBeenCalledWith(4)
      expect(s.form.publicIp).toBe('84.54.72.10')
      expect(s.ipLoading.value).toBe(false)
      expect(notify.success).toHaveBeenCalledTimes(1)
    })

    it('notifies an error, does not throw, and clears ipLoading when captureCenterIp rejects', async () => {
      mockedCaptureCenterIp.mockRejectedValueOnce(new Error('network error'))
      const s = useCenterAttendance()

      await expect(s.captureIp(4)).resolves.toBeUndefined()

      expect(s.ipLoading.value).toBe(false)
      expect(notify.error).toHaveBeenCalledTimes(1)
      expect(notify.success).not.toHaveBeenCalled()
    })
  })
})
