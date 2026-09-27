/** A holiday / day off from GET /holidays — no lessons in any group. */
export interface Holiday {
  id: number
  /** `null` — the whole organization (all centers). */
  centerId: number | null
  /** `YYYY-MM-DD`, inclusive. */
  fromDate: string
  /** `YYYY-MM-DD`, inclusive. */
  toDate: string
  name: string
  createdAt: string
}

/** POST /holidays body. `centerId` null/omitted = the whole organization. */
export interface HolidayForm {
  fromDate: string
  toDate: string
  name: string
  centerId?: number | null
}

/** GET /holidays params (`centerId` comes from the interceptor). */
export interface HolidaysParams {
  year?: number
}
