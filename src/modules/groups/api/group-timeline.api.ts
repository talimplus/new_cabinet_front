import { http } from '@/shared/api/http'
import type { GroupTimelineEvent } from '../interfaces/group-timeline.interface'

/**
 * GET /groups/{id}/timeline — teacher, schedule, fee, pauses, moved lessons
 * and student moves, newest first. A bare array (no wrapper).
 */
export async function fetchGroupTimeline(groupId: number): Promise<GroupTimelineEvent[]> {
  const { data } = await http.get<GroupTimelineEvent[]>(`/groups/${groupId}/timeline`)
  return Array.isArray(data) ? data : []
}
