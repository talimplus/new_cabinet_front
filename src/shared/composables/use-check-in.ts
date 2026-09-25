import { ref } from 'vue'
import { fetchMyAttendanceToday, checkIn } from '@/shared/api/staff-attendance.api'
import { optionalRequest } from '@/shared/permissions/optional-request'
import { useNotificationStore } from '@/stores/notification.store'
import type { CheckInForm, StaffAttendanceToday } from '@/shared/interfaces/staff-attendance.interface'
import { t } from '@/locales'

/** Reads/creates a stable per-device id; the backend uses it to spot shared devices. */
function getDeviceId(): string | undefined {
  try {
    let id = localStorage.getItem('deviceId')
    if (!id) {
      id = crypto.randomUUID?.() ?? `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem('deviceId', id)
    }
    return id
  } catch {
    return undefined
  }
}

/** Resolves the current position, or null when unavailable/denied (check-in still proceeds). */
function getPosition(): Promise<GeolocationPosition | null> {
  if (!navigator.geolocation) return Promise.resolve(null)
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  })
}

/**
 * The teacher's "Keldim" check-in: reads today's state, then on submit captures
 * geolocation + device id and posts them. Missing coords are allowed — the
 * backend just records a lower-confidence check-in.
 */
export function useCheckIn() {
  const notify = useNotificationStore()

  const today = ref<StaffAttendanceToday | null>(null)
  const loading = ref(false)
  const submitting = ref(false)

  async function load(): Promise<void> {
    loading.value = true
    try {
      today.value = await optionalRequest(fetchMyAttendanceToday(), null)
    } finally {
      loading.value = false
    }
  }

  async function submit(): Promise<void> {
    submitting.value = true
    try {
      const position = await getPosition()
      const form: CheckInForm = { deviceId: getDeviceId() }
      if (position) {
        form.latitude = position.coords.latitude
        form.longitude = position.coords.longitude
        form.accuracyMeters = Math.round(position.coords.accuracy)
      }
      const result = await checkIn(form)
      if (result.alreadyCheckedIn) notify.info(t('staffAttendance.card.alreadyCheckedIn'))
      else if (result.attendance.lateMinutes > 0)
        notify.warning(t('staffAttendance.card.lateBy', { minutes: result.attendance.lateMinutes }))
      else notify.success(t('staffAttendance.card.success'))
      await load()
    } catch {
      /* the interceptor already toasted the error */
    } finally {
      submitting.value = false
    }
  }

  return { today, loading, submitting, load, submit }
}
