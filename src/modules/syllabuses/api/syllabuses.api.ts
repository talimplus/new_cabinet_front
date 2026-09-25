import { http } from '@/shared/api/http'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'
import type {
  Syllabus,
  SyllabusListItem,
  SyllabusTopic,
} from '../interfaces/syllabus.interface'
import type { SyllabusForm } from '../interfaces/syllabus-form.interface'
import type { SyllabusesParams } from '../interfaces/syllabus-params.interface'
import type { TopicForm } from '../interfaces/topic-form.interface'
import type {
  GenerateContentPayload,
  GeneratedTopicContent,
} from '../interfaces/topic-content.interface'
import type {
  AiChatPayload,
  AiChatResponse,
  AiSavePayload,
} from '../interfaces/ai-syllabus.interface'

// ---- Syllabuses -------------------------------------------------------

export async function fetchSyllabuses(
  params?: SyllabusesParams,
): Promise<PaginatedResponse<SyllabusListItem>> {
  const { data } = await http.get<PaginatedResponse<SyllabusListItem>>('/syllabuses', { params })
  return data
}

export async function fetchSyllabusById(id: number | string): Promise<Syllabus> {
  const { data } = await http.get<Syllabus>(`/syllabuses/${id}`)
  return data
}

/** Center is derived from the subject — no `centerId` in the body. */
export async function createSyllabus(form: SyllabusForm): Promise<Syllabus> {
  const { data } = await http.post<Syllabus>('/syllabuses', form)
  return data
}

export async function updateSyllabus(id: number, form: SyllabusForm): Promise<Syllabus> {
  const { data } = await http.put<Syllabus>(`/syllabuses/${id}`, form)
  return data
}

export async function deleteSyllabus(id: number): Promise<void> {
  await http.delete(`/syllabuses/${id}`)
}

// ---- Topics -----------------------------------------------------------

export async function createTopic(id: number | string, form: TopicForm): Promise<SyllabusTopic> {
  const { data } = await http.post<SyllabusTopic>(`/syllabuses/${id}/topics`, form)
  return data
}

export async function updateTopic(
  id: number | string,
  topicId: number,
  form: TopicForm,
): Promise<SyllabusTopic> {
  const { data } = await http.put<SyllabusTopic>(`/syllabuses/${id}/topics/${topicId}`, form)
  return data
}

export async function deleteTopic(id: number | string, topicId: number): Promise<void> {
  await http.delete(`/syllabuses/${id}/topics/${topicId}`)
}

export async function reorderTopics(id: number | string, topicIds: number[]): Promise<void> {
  await http.put(`/syllabuses/${id}/topics/reorder`, { topicIds })
}

export async function generateTopicContent(
  id: number | string,
  topicId: number,
  payload: GenerateContentPayload,
): Promise<GeneratedTopicContent> {
  const { data } = await http.post<GeneratedTopicContent>(
    `/syllabuses/${id}/topics/${topicId}/generate-content`,
    payload,
  )
  return data
}

// ---- AI plan builder --------------------------------------------------

export async function aiChat(payload: AiChatPayload): Promise<AiChatResponse> {
  const { data } = await http.post<AiChatResponse>('/syllabuses/ai/chat', payload)
  return data
}

export async function aiSavePlan(payload: AiSavePayload): Promise<Syllabus> {
  const { data } = await http.post<Syllabus>('/syllabuses/ai/save', payload)
  return data
}
