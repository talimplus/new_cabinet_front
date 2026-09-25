/**
 * POST/PUT /centers body. The attendance fields are edit-only (capturing the IP
 * needs the center's id); `null` on any of them clears the stored value so an
 * empty field never lands as `0` (docs §5, backend "null — tozalash").
 */
export interface CenterForm {
  name: string
  isDefault?: boolean
  latitude?: number | null
  longitude?: number | null
  checkInRadiusMeters?: number | null
  publicIp?: string | null
}
