import {
  ArrowLeftRight, BadgeDollarSign, CalendarDays, CalendarRange, CheckCheck, DoorOpen, Flag,
  GraduationCap, Pause, UserPlus, type FunctionalComponent,
} from '@/shared/icons'
import { t } from '@/locales'
import { formatSom } from '@/shared/utils/format-money'
import { formatDate } from '@/shared/utils/format-date'
import { TimelineTone as Tone } from '@/shared/enums/timeline-tone.enum'
import { WEEK_DAY_SHORT_KEYS, WeekDay } from '../enums/week-day.enum'
import { GroupTimelineType as T } from '../enums/group-timeline.enum'
import type { GroupTimelineData as D, GroupTimelineDay, GroupTimelineEvent } from '../interfaces/group-timeline.interface'
import type { TimelineEntryView, TimelineLink } from '@/shared/interfaces/timeline-entry.interface'

/** What the viewer may open — a name without a reachable page stays plain text. */
export interface GroupTimelineLinkAccess {
  students: boolean
  groups: boolean
}

interface Shape {
  icon: FunctionalComponent
  tone: Tone
  title: string
  subject?: TimelineLink | null
  lines?: (string | false | null | undefined)[]
  note?: string | null
  group?: TimelineLink | null
  /** Planned by nature (end date not reached), not just dated ahead. */
  planned?: boolean
}

const k = (key: string, params?: Record<string, unknown>) => t(`groups.timeline.${key}`, params ?? {})
const teacher = (name?: string | null) => name || k('noTeacher')
const ORDER = Object.values(WeekDay)

/** `Du 14:00, Ch 14:00` — weekdays in calendar order. */
export function scheduleLabel(days?: GroupTimelineDay[] | null): string {
  return [...(days ?? [])]
    .sort((a, b) => ORDER.indexOf(a.day) - ORDER.indexOf(b.day))
    .map((d) => `${WEEK_DAY_SHORT_KEYS[d.day] ? t(WEEK_DAY_SHORT_KEYS[d.day]) : d.day} ${String(d.startTime ?? '').slice(0, 5)}`)
    .join(', ')
}

const period = (from?: string | null, to?: string | null) =>
  from && k('lines.period', { from: formatDate(from), to: to ? formatDate(to) : '…' })

function shapes(e: GroupTimelineEvent, access: GroupTimelineLinkAccess): Shape | null {
  const d: D = e.data ?? {}
  const student = (): TimelineLink => ({
    text: d.studentName || `#${d.studentId ?? '?'}`,
    to: access.students && d.studentId ? { name: 'student-card', params: { id: d.studentId } } : null,
  })
  const otherGroup = (): TimelineLink | null => d.groupId
    ? { text: d.groupName || `#${d.groupId}`, to: access.groups ? { name: 'group-detail', params: { id: d.groupId } } : null }
    : null

  switch (e.type) {
    case T.GROUP_CREATED: return { icon: Flag, tone: Tone.PRIMARY, title: k('title.groupCreated') }
    case T.GROUP_STARTED: return { icon: CalendarDays, tone: Tone.SUCCESS, title: k('title.groupStarted') }
    case T.GROUP_FINISHED: return { icon: CheckCheck, tone: Tone.NEUTRAL, title: k('title.groupFinished') }
    case T.GROUP_END_PLANNED: return { icon: Flag, tone: Tone.NEUTRAL, title: k('title.groupEndPlanned'), planned: true }
    case T.TEACHER_ASSIGNED:
      return { icon: GraduationCap, tone: Tone.PRIMARY, title: k('title.teacherAssigned', { name: teacher(d.teacherName) }) }
    case T.TEACHER_CHANGED:
      return {
        icon: GraduationCap, tone: Tone.INFO, title: k('title.teacherChanged'),
        lines: [`${teacher(d.previousTeacherName)} → ${teacher(d.teacherName)}`],
      }
    case T.SCHEDULE_SET:
      return { icon: CalendarRange, tone: Tone.PRIMARY, title: k('title.scheduleSet'), lines: [scheduleLabel(d.days)] }
    case T.SCHEDULE_CHANGED:
      return {
        icon: CalendarRange, tone: Tone.INFO, title: k('title.scheduleChanged'),
        lines: [`${scheduleLabel(d.previousDays)} → ${scheduleLabel(d.days)}`],
      }
    case T.FEE_SET:
    case T.FEE_CHANGED: {
      const changed = e.type === T.FEE_CHANGED && d.previousMonthlyFee != null
      return {
        icon: BadgeDollarSign, tone: changed ? Tone.INFO : Tone.PRIMARY,
        title: k(changed ? 'title.feeChanged' : 'title.feeSet'),
        lines: [
          changed ? `${formatSom(d.previousMonthlyFee)} → ${formatSom(d.monthlyFee)}` : formatSom(d.monthlyFee),
          k('fromMonth', { month: e.date.slice(0, 7) }),
        ],
      }
    }
    case T.PAUSE:
      return { icon: Pause, tone: Tone.WARNING, title: k('title.pause'), lines: [period(d.fromDate, d.toDate)], note: d.reason }
    case T.LESSON_MOVED:
      return {
        icon: ArrowLeftRight, tone: Tone.INFO, title: k('title.lessonMoved'),
        lines: [d.fromDate && `${formatDate(d.fromDate)} → ${d.toDate ? formatDate(d.toDate) : '…'}`], note: d.reason,
      }
    case T.STUDENT_JOINED:
      return { icon: UserPlus, tone: Tone.SUCCESS, title: k('title.studentJoined'), subject: student() }
    case T.STUDENT_LEFT:
      return { icon: DoorOpen, tone: Tone.WARNING, title: k('title.studentLeft'), subject: student(), note: d.reason }
    case T.STUDENT_TRANSFERRED_IN:
      return { icon: ArrowLeftRight, tone: Tone.INFO, title: k('title.studentTransferredIn'), subject: student(), group: otherGroup() }
    case T.STUDENT_TRANSFERRED_OUT:
      return { icon: ArrowLeftRight, tone: Tone.WARNING, title: k('title.studentTransferredOut'), subject: student(), group: otherGroup() }
    default:
      return null
  }
}

/**
 * Turns one backend group event into render-ready text. Titles are built from
 * `data` (so Russian works and names become links); an unknown type falls back
 * to the backend's ready Uzbek `title`. `today` (`YYYY-MM-DD`) marks events
 * dated ahead — a planned start or end — as planned.
 */
export function describeGroupEvent(
  e: GroupTimelineEvent,
  id: string,
  access: GroupTimelineLinkAccess,
  today: string,
): TimelineEntryView {
  const shape: Shape = shapes(e, access) ?? { icon: Flag, tone: Tone.NEUTRAL, title: e.title }
  const planned = !!shape.planned || e.date > today
  const title = e.type === T.GROUP_STARTED && planned ? k('title.groupStartPlanned') : shape.title
  return {
    id,
    icon: shape.icon,
    tone: shape.tone,
    title,
    subject: shape.subject ?? null,
    lines: (shape.lines ?? []).filter((l): l is string => typeof l === 'string' && l.length > 0),
    note: shape.note?.trim() || null,
    amount: null,
    badge: planned ? { text: k('planned'), variant: 'neutral' } : null,
    time: null,
    actor: e.data?.createdByName || null,
    group: shape.group ?? null,
    planned,
  }
}
