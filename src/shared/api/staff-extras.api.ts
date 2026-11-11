import { http } from '@/shared/api/http'
import type { StaffAdvanceForm, StaffBonusForm } from '@/shared/interfaces/staff-extras.interface'

/**
 * Advance / bonus for an employee. In `shared/` because three modules open the
 * same dialog (users list, staff page, payroll). Responses are not read — every
 * caller reloads its own view afterwards.
 */

/** POST /staff/advances — 400 when the month is past next month. */
export async function createStaffAdvance(form: StaffAdvanceForm): Promise<void> {
  await http.post('/staff/advances', form)
}

/** POST /staff/bonuses — `reason` required; the month may not be in the future. */
export async function createStaffBonus(form: StaffBonusForm): Promise<void> {
  await http.post('/staff/bonuses', form)
}
