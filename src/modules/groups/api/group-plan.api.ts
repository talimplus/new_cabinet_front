import { http } from '@/shared/api/http'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'
import type {
  GroupPlan,
  SyllabusListItem,
  SyllabusesParams,
  DistributeForm,
} from '../interfaces/group-plan.interface'

export async function fetchGroupPlan(groupId: number): Promise<GroupPlan> {
  const { data } = await http.get<GroupPlan>(`/groups/${groupId}/plan`)
  return data
}

/** Attach/replace a syllabus, or detach it by passing `null`. */
export async function setGroupSyllabus(groupId: number, syllabusId: number | null): Promise<void> {
  await http.put(`/groups/${groupId}/plan/syllabus`, { syllabusId })
}

/** Set the FULL list of topics for one lesson (empty array clears it). */
export async function setLessonTopics(
  groupId: number,
  lessonNumber: number,
  topicIds: number[],
): Promise<void> {
  await http.put(`/groups/${groupId}/plan/lessons/${lessonNumber}/topics`, { topicIds })
}

/** Recompute the plan; returns the updated GroupPlan. */
export async function distributePlan(groupId: number, form: DistributeForm): Promise<GroupPlan> {
  const { data } = await http.post<GroupPlan>(`/groups/${groupId}/plan/distribute`, form)
  return data
}

export async function fetchSyllabuses(
  params?: SyllabusesParams,
): Promise<PaginatedResponse<SyllabusListItem>> {
  const { data } = await http.get<PaginatedResponse<SyllabusListItem>>('/syllabuses', { params })
  return data
}
