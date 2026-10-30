import { http } from '@/shared/api/http'
import type { Group } from '../interfaces/group.interface'
import type { GroupForm } from '../interfaces/group-form.interface'
import type { GroupsParams } from '../interfaces/group-params.interface'
import type { GroupStatus } from '../enums/group-status.enum'
import type {
  GroupStartForm,
  GroupStartPreview,
  GroupStartPreviewForm,
} from '../interfaces/group-start.interface'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'

export async function fetchGroups(params: GroupsParams): Promise<PaginatedResponse<Group>> {
  const { data } = await http.get<PaginatedResponse<Group>>('/groups', { params })
  return data
}

/** GET /groups/{id} — a single group with center/subject/teacher/room/schedules. */
export async function fetchGroupById(id: number | string): Promise<Group> {
  const { data } = await http.get<Group>(`/groups/${id}`)
  return data
}

/**
 * Full non-paginated group list for a center (used in select options).
 * `teacherId` narrows it to that teacher's groups — the /payments filter pair.
 */
export async function fetchAllGroups(centerId?: number, teacherId?: number): Promise<Group[]> {
  const { data } = await http.get<Group[]>('/groups/all', { params: { centerId, teacherId } })
  return data
}

export async function createGroup(form: GroupForm): Promise<Group> {
  const { data } = await http.post<Group>('/groups', form)
  return data
}

export async function updateGroup(id: number, form: GroupForm): Promise<Group> {
  const { data } = await http.put<Group>(`/groups/${id}`, form)
  return data
}

export async function deleteGroup(id: number): Promise<void> {
  await http.delete(`/groups/${id}`)
}

/** PUT /groups/change-status/:id — `extra` only when starting (the real start date). */
export async function changeGroupStatus(
  id: number,
  status: GroupStatus,
  extra?: GroupStartForm,
): Promise<void> {
  await http.put(`/groups/change-status/${id}`, { status, ...extra })
}

/** POST /groups/:id/start-date/preview — the payment impact of a new start date; writes nothing. */
export async function previewGroupStartDate(
  id: number,
  form: GroupStartPreviewForm,
): Promise<GroupStartPreview> {
  const { data } = await http.post<GroupStartPreview>(`/groups/${id}/start-date/preview`, form)
  return data
}
