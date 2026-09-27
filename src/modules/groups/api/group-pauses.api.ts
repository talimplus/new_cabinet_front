import { http } from '@/shared/api/http'
import type { GroupPause, GroupPauseForm } from '../interfaces/group-pause.interface'

/** GET /groups/{id}/pauses — the group's paused periods, newest first. */
export async function fetchGroupPauses(groupId: number): Promise<GroupPause[]> {
  const { data } = await http.get<GroupPause[]>(`/groups/${groupId}/pauses`)
  return Array.isArray(data) ? data : []
}

/** POST /groups/{id}/pauses — pause the group; its payments are recalculated. */
export async function createGroupPause(groupId: number, form: GroupPauseForm): Promise<GroupPause> {
  const { data } = await http.post<GroupPause>(`/groups/${groupId}/pauses`, form)
  return data
}

/** DELETE /groups/{id}/pauses/{pauseId} — lessons come back, payments recalculated. */
export async function deleteGroupPause(groupId: number, pauseId: number): Promise<void> {
  await http.delete(`/groups/${groupId}/pauses/${pauseId}`)
}
