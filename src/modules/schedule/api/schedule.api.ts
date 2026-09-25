import { http } from '@/shared/api/http'
import type { ScheduleBoard } from '../interfaces/schedule-board.interface'
import type {
  ScheduleConflict,
  ScheduleConflictForm,
} from '../interfaces/schedule-conflict.interface'

/**
 * GET /group-schedule/board — rooms + every non-finished group's lesson slots.
 * The http interceptor injects the active `centerId` (the endpoint accepts it).
 */
export async function fetchScheduleBoard(): Promise<ScheduleBoard> {
  const { data } = await http.get<ScheduleBoard>('/group-schedule/board')
  return data
}

/**
 * POST /group-schedule/conflicts — room/teacher clashes for the given slots.
 * A background check while the group form is edited: `skipGlobalError`, so a
 * failure doesn't toast (the backend re-checks on save anyway).
 */
export async function checkScheduleConflicts(form: ScheduleConflictForm): Promise<ScheduleConflict[]> {
  const { data } = await http.post<ScheduleConflict[]>('/group-schedule/conflicts', form, {
    skipGlobalError: true,
  })
  return data
}
