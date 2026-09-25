import type { GroupStatus } from '@/modules/groups/enums/group-status.enum'
import type { SyllabusTopic } from '@/modules/syllabuses/interfaces/syllabus-topic.interface'
import type { TeacherScope } from '../enums/teacher-scope.enum'

export interface TodayLessonRef {
  id: number
  name: string
}

export interface TodayLessonGroup {
  id: number
  name: string
  status: GroupStatus
  subject: TodayLessonRef | null
  room: TodayLessonRef | null
}

export interface TodayLessonTeacher {
  id: number
  firstName: string
  lastName: string
}

export interface TodayLesson {
  group: TodayLessonGroup
  teacher: TodayLessonTeacher | null
  date: string
  startTime: string | null
  lessonNumber: number
  hasSyllabus: boolean
  topics: SyllabusTopic[]
  previousTopics: SyllabusTopic[]
}

/** GET /teachers/me/today response. */
export interface TeacherToday {
  date: string
  scope: TeacherScope
  canCheckIn: boolean
  lessons: TodayLesson[]
}
