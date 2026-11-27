import { http } from '@/shared/api/http'
import type {
  StaffAdvanceForm,
  StaffAdvancePatch,
  StaffAdvanceResult,
  StaffBonusForm,
  StaffBonusPatch,
} from '@/shared/interfaces/staff-extras.interface'

/**
 * Advance / bonus for an employee. In `shared/` because three modules open the
 * same dialog (users list, staff page, payroll). Only the advance answer is read
 * (its split over salaries); every caller reloads its own view afterwards.
 */

/**
 * POST /staff/advances — 400 when the month is past next month. The answer
 * says which salaries it is withheld from (shown in the success message).
 */
export async function createStaffAdvance(form: StaffAdvanceForm): Promise<StaffAdvanceResult> {
  const { data } = await http.post<StaffAdvanceResult>('/staff/advances', form)
  return data
}

/** POST /staff/bonuses — `reason` required; the month may not be in the future. */
export async function createStaffBonus(form: StaffBonusForm): Promise<void> {
  await http.post('/staff/bonuses', form)
}

/** PATCH /staff/advances/{id} — fix a mistaken advance; it is withheld again from the new month. */
export async function updateStaffAdvance(id: number, patch: StaffAdvancePatch): Promise<void> {
  await http.patch(`/staff/advances/${id}`, patch)
}

/** PATCH /staff/bonuses/{id} — 400 when lowering / moving a bonus already paid out with the salary. */
export async function updateStaffBonus(id: number, patch: StaffBonusPatch): Promise<void> {
  await http.patch(`/staff/bonuses/${id}`, patch)
}
