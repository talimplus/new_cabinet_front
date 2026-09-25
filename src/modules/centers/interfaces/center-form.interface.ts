/**
 * POST/PUT /centers body. The attendance fields are edit-only (capturing the IP
 * needs the center's id). `null` clears latitude/longitude/publicIp so an empty
 * field never lands as `0` (docs §5, backend "null — tozalash").
 * ⚠️ `checkInRadiusMeters` has NO clear semantics (non-null column, default 150):
 * a blank radius is omitted, never sent as `null` (the backend would store 0).
 */
export interface CenterForm {
  name: string
  isDefault?: boolean
  latitude?: number | null
  longitude?: number | null
  checkInRadiusMeters?: number
  publicIp?: string | null
}
