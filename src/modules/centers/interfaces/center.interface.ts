export interface Center {
  id: number
  name: string
  isDefault?: boolean
  organizationId?: number
  createdAt?: string
  timezone?: string
  /** Staff-attendance geofence (docs §5) — null until set from the map / "my location". */
  latitude?: number | null
  longitude?: number | null
  checkInRadiusMeters?: number | null
  /** Center Wi-Fi public IP — set via POST /centers/:id/capture-ip. */
  publicIp?: string | null
}

/** POST /centers/:id/capture-ip response — the external IP the server recorded. */
export interface CaptureIpResponse {
  publicIp: string
}
