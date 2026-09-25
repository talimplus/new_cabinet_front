import { reactive, ref } from 'vue'
import type { AxiosError } from 'axios'
import { t } from '@/locales'
import { useNotificationStore } from '@/stores/notification.store'
import { resolveErrorMessage } from '@/shared/utils/error-message'
import { captureCenterIp } from '../api/centers.api'
import type { Center } from '../interfaces/center.interface'

/** The slice of the payload this composable owns. */
export interface CenterAttendancePayload {
  latitude: number | null
  longitude: number | null
  /** Omitted when blank — the radius cannot be cleared, only changed. */
  checkInRadiusMeters?: number
  publicIp: string | null
}

/** Empty or non-finite → null, so a blank field never lands as `0`.
 *  Number fields are `''` while empty (UiInput clears a number to `''`). */
function toCoord(value: number | ''): number | null {
  if (value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

/**
 * Staff-attendance settings for the center edit form: the geofence coordinates,
 * radius and Wi-Fi IP, plus the two one-tap helpers (browser geolocation and
 * server-side IP capture). Kept out of vee-validate because the buttons set the
 * values programmatically and none of the fields are validated.
 */
export function useCenterAttendance() {
  const notify = useNotificationStore()

  const geoLoading = ref(false)
  const ipLoading = ref(false)

  const form = reactive({
    latitude: '' as number | '',
    longitude: '' as number | '',
    checkInRadiusMeters: 150 as number | '',
    publicIp: '',
  })

  function applyFrom(center: Center | null): void {
    form.latitude = center?.latitude ?? ''
    form.longitude = center?.longitude ?? ''
    form.checkInRadiusMeters = center?.checkInRadiusMeters ?? 150
    form.publicIp = center?.publicIp ?? ''
  }

  /** Admin standing in the center: browser coords drop into the fields (7 dp). */
  function useCurrentPosition(): void {
    if (!navigator.geolocation) {
      notify.error(t('centers.attendance.geoUnsupported'))
      return
    }
    geoLoading.value = true
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.latitude = Number(position.coords.latitude.toFixed(7))
        form.longitude = Number(position.coords.longitude.toFixed(7))
        geoLoading.value = false
        notify.success(t('centers.attendance.geoTaken'))
      },
      () => {
        geoLoading.value = false
        notify.error(t('centers.attendance.geoDenied'))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  /** Pressed on the center's Wi-Fi: the server records the request's external IP. */
  async function captureIp(centerId: number): Promise<void> {
    ipLoading.value = true
    try {
      const { publicIp } = await captureCenterIp(centerId)
      form.publicIp = publicIp
      notify.success(t('centers.attendance.ipTaken', { ip: publicIp }))
    } catch (error) {
      // Surface why it failed (e.g. loopback IP rejected) — global toast is off.
      notify.error(resolveErrorMessage(error as AxiosError) || t('centers.attendance.ipError'))
    } finally {
      ipLoading.value = false
    }
  }

  function toPayload(): CenterAttendancePayload {
    const payload: CenterAttendancePayload = {
      latitude: toCoord(form.latitude),
      longitude: toCoord(form.longitude),
      publicIp: form.publicIp.trim() ? form.publicIp.trim() : null,
    }
    const radius = toCoord(form.checkInRadiusMeters)
    if (radius !== null) payload.checkInRadiusMeters = radius
    return payload
  }

  return { form, geoLoading, ipLoading, applyFrom, useCurrentPosition, captureIp, toPayload }
}
