import type { Center } from '@/modules/centers/interfaces/center.interface'
import type { Subject } from '@/modules/subjects/interfaces/subject.interface'
import type { Room } from '@/modules/rooms/interfaces/room.interface'
import type { WeekDay } from '../enums/week-day.enum'
import type { GroupStatus } from '../enums/group-status.enum'

export interface GroupSchedule {
  id?: number
  day: WeekDay
  startTime: string
}

export interface GroupTeacher {
  id: number
  firstName?: string
  lastName?: string
}

export interface Group {
  id: number
  name: string
  /** Current month's active price. Backend serializes it as a STRING ("400000"). */
  monthlyFee: number | string | null
  /** Lesson length in minutes (the room/teacher busy window). */
  lessonDurationMinutes?: number | null
  status?: GroupStatus
  schedules?: GroupSchedule[]
  center?: Center
  subject?: Subject
  teacher?: GroupTeacher | null
  room?: Room | null
  timezone?: string
  startDate?: string
  endDate?: string | null
  startedAt?: string | null
  /** Scheduled price for next month (null when none is queued). */
  upcomingMonthlyFee?: number | string | null
  /** `YYYY-MM-01` — the month the upcoming price starts. */
  upcomingFeeFromMonth?: string | null
  createdAt?: string
  /** UI-only: per-row status-change spinner. */
  statusLoading?: boolean
}
