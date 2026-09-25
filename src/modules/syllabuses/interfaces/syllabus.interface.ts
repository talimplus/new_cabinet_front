import type { SyllabusTopic } from './syllabus-topic.interface'

// Re-export so consumers can pull the topic shape from here too.
export type { SyllabusTopic } from './syllabus-topic.interface'

/** Row shape from `GET /syllabuses` (list, no full topics — just a count). */
export interface SyllabusListItem {
  id: number
  name: string
  description: string | null
  subject: { id: number; name: string }
  topicsCount: number
  createdAt: string
}

/** Full syllabus from `GET /syllabuses/{id}` — includes the ordered topics. */
export interface Syllabus {
  id: number
  name: string
  description: string | null
  subject: { id: number; name: string }
  /** The center derived from the subject — edits may only pick subjects of it. */
  center?: { id: number; name: string }
  topics: SyllabusTopic[]
}
