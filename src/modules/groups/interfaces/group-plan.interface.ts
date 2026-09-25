import type { GroupStatus } from '../enums/group-status.enum'
import type { TopicDifficulty } from '../enums/topic-difficulty.enum'

/** A single topic inside a syllabus. Field names/casing mirror the backend. */
export interface SyllabusTopic {
  id: number
  orderIndex: number
  title: string
  description: string | null
  difficulty: TopicDifficulty | null
  estimatedLessons: number | null
  guide: string | null
  lessonOutline: string | null
  homework: string | null
}

/** A syllabus topic in the context of a group plan — `isAssigned` is added. */
export interface PlanTopic extends SyllabusTopic {
  isAssigned?: boolean
}

/** One lesson slot in the distributed plan. */
export interface PlanLesson {
  lessonNumber: number
  date: string | null
  isPast: boolean
  isToday: boolean
  topics: PlanTopic[]
}

export interface PlanGroupSubject {
  id: number
  name: string
}

export interface PlanGroup {
  id: number
  name: string
  status: GroupStatus
  startDate: string | null
  endDate: string | null
  durationMonths: number | null
  subject: PlanGroupSubject | null
}

export interface PlanSyllabus {
  id: number
  name: string
  description: string | null
  topics: PlanTopic[]
}

/** GET /groups/{groupId}/plan */
export interface GroupPlan {
  group: PlanGroup
  syllabus: PlanSyllabus | null
  timezone: string
  today: string
  totalLessons: number | null
  horizonDate: string | null
  lessons: PlanLesson[]
}

/** One row of GET /syllabuses (used to pick a syllabus to attach). */
export interface SyllabusListItem {
  id: number
  name: string
  description: string | null
  subject: PlanGroupSubject
  topicsCount: number
  createdAt: string
}

/** PUT /groups/{groupId}/plan/syllabus — attach/replace/detach (null = detach). */
export interface SetSyllabusForm {
  syllabusId: number | null
}

/** PUT /groups/{groupId}/plan/lessons/{lessonNumber}/topics */
export interface SetLessonTopicsForm {
  topicIds: number[]
}

/** POST /groups/{groupId}/plan/distribute */
export interface DistributeForm {
  totalLessons?: number
  instructions?: string
}

/** GET /syllabuses query params. */
export interface SyllabusesParams {
  centerId?: number
  subjectId?: number
  name?: string
  page?: number
  perPage?: number
}
