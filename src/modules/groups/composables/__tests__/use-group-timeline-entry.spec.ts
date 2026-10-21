import { describe, it, expect } from 'vitest'
import { t } from '@/locales'
import { formatSom } from '@/shared/utils/format-money'
import { TimelineTone } from '@/shared/enums/timeline-tone.enum'
import { describeGroupEvent, scheduleLabel } from '../use-group-timeline-entry'
import { GroupTimelineType as T } from '../../enums/group-timeline.enum'
import { WEEK_DAY_SHORT_KEYS, WeekDay } from '../../enums/week-day.enum'
import type { GroupTimelineData, GroupTimelineEvent } from '../../interfaces/group-timeline.interface'

const TODAY = '2026-10-21'
const ALL = { students: true, groups: true }
const NONE = { students: false, groups: false }
const ev = (type: T, data: GroupTimelineData = {}, date = '2026-10-01', title = 'backend title'): GroupTimelineEvent =>
  ({ type, date, data, title })
const describe1 = (e: GroupTimelineEvent, access = ALL) => describeGroupEvent(e, 'id1', access, TODAY)
const tt = (k: string, p?: Record<string, unknown>) => t(`groups.timeline.title.${k}`, p ?? {})

describe('scheduleLabel', () => {
  it('sorts by weekday and uses short labels with HH:mm', () => {
    const label = scheduleLabel([
      { day: WeekDay.FRIDAY, startTime: '16:30:00' },
      { day: WeekDay.MONDAY, startTime: '14:00:00' },
    ])
    expect(label).toBe(`${t(WEEK_DAY_SHORT_KEYS[WeekDay.MONDAY])} 14:00, ${t(WEEK_DAY_SHORT_KEYS[WeekDay.FRIDAY])} 16:30`)
  })
  it('handles empty input', () => {
    expect(scheduleLabel(null)).toBe('')
    expect(scheduleLabel(undefined)).toBe('')
  })
})

describe('describeGroupEvent', () => {
  it('maps simple group events to titles and tones', () => {
    expect(describe1(ev(T.GROUP_CREATED))).toMatchObject({ id: 'id1', title: tt('groupCreated'), tone: TimelineTone.PRIMARY })
    expect(describe1(ev(T.GROUP_STARTED))).toMatchObject({ title: tt('groupStarted'), tone: TimelineTone.SUCCESS })
    expect(describe1(ev(T.GROUP_FINISHED))).toMatchObject({ title: tt('groupFinished'), tone: TimelineTone.NEUTRAL })
  })

  it('teacher_assigned uses the name, falls back to noTeacher', () => {
    expect(describe1(ev(T.TEACHER_ASSIGNED, { teacherName: 'Ali' })).title).toBe(tt('teacherAssigned', { name: 'Ali' }))
    expect(describe1(ev(T.TEACHER_ASSIGNED)).title).toBe(tt('teacherAssigned', { name: t('groups.timeline.noTeacher') }))
  })

  it('teacher_changed shows "prev → next" with noTeacher fallback', () => {
    const r = describe1(ev(T.TEACHER_CHANGED, { previousTeacherName: 'Ali', teacherName: 'Vali' }))
    expect(r.title).toBe(tt('teacherChanged'))
    expect(r.lines).toEqual(['Ali → Vali'])
    expect(describe1(ev(T.TEACHER_CHANGED, { teacherName: 'Vali' })).lines).toEqual([`${t('groups.timeline.noTeacher')} → Vali`])
  })

  it('schedule_set / schedule_changed list the schedules', () => {
    const days = [{ day: WeekDay.TUESDAY, startTime: '10:00:00' }]
    const prev = [{ day: WeekDay.MONDAY, startTime: '09:00:00' }]
    expect(describe1(ev(T.SCHEDULE_SET, { days })).lines).toEqual([scheduleLabel(days)])
    const r = describe1(ev(T.SCHEDULE_CHANGED, { days, previousDays: prev }))
    expect(r.title).toBe(tt('scheduleChanged'))
    expect(r.lines).toEqual([`${scheduleLabel(prev)} → ${scheduleLabel(days)}`])
  })

  it('fee_changed shows old → new and the from-month', () => {
    const r = describe1(ev(T.FEE_CHANGED, { previousMonthlyFee: 400000, monthlyFee: 500000 }, '2026-11-01'))
    expect(r.title).toBe(tt('feeChanged'))
    expect(r.lines).toEqual([
      `${formatSom(400000)} → ${formatSom(500000)}`,
      t('groups.timeline.fromMonth', { month: '2026-11' }),
    ])
  })

  it('fee_set (and fee_changed without a previous fee) is a plain set', () => {
    const r = describe1(ev(T.FEE_SET, { monthlyFee: 500000 }, '2026-11-01'))
    expect(r.title).toBe(tt('feeSet'))
    expect(r.lines[0]).toBe(formatSom(500000))
    expect(describe1(ev(T.FEE_CHANGED, { monthlyFee: 500000 })).title).toBe(tt('feeSet'))
  })

  it('pause carries a period line and the reason as note', () => {
    const r = describe1(ev(T.PAUSE, { fromDate: '2026-10-01', toDate: '2026-10-05', reason: ' Bayram ' }))
    expect(r.title).toBe(tt('pause'))
    expect(r.lines).toHaveLength(1)
    expect(r.tone).toBe(TimelineTone.WARNING)
    expect(r.note).toBe('Bayram')
  })

  it('lesson_moved shows from → to', () => {
    const r = describe1(ev(T.LESSON_MOVED, { fromDate: '2026-10-01', toDate: '2026-10-02', reason: 'sabab' }))
    expect(r.title).toBe(tt('lessonMoved'))
    expect(r.lines[0]).toContain(' → ')
    expect(r.note).toBe('sabab')
  })

  it('student subject links to student-card only with students access', () => {
    const e = ev(T.STUDENT_JOINED, { studentId: 7, studentName: 'Ola' })
    expect(describe1(e).subject).toEqual({ text: 'Ola', to: { name: 'student-card', params: { id: 7 } } })
    expect(describe1(e, NONE).subject).toEqual({ text: 'Ola', to: null })
    expect(describe1(ev(T.STUDENT_JOINED, { studentId: 7 })).subject?.text).toBe('#7')
  })

  it('student_left keeps reason as note', () => {
    const r = describe1(ev(T.STUDENT_LEFT, { studentId: 1, studentName: 'A', reason: 'ketdi' }))
    expect(r.title).toBe(tt('studentLeft'))
    expect(r.note).toBe('ketdi')
  })

  it('transfer group link goes to group-detail only with groups access', () => {
    const e = ev(T.STUDENT_TRANSFERRED_IN, { studentId: 1, studentName: 'A', groupId: 9, groupName: 'B-2' })
    expect(describe1(e).group).toEqual({ text: 'B-2', to: { name: 'group-detail', params: { id: 9 } } })
    expect(describe1(e, NONE).group).toEqual({ text: 'B-2', to: null })
    expect(describe1(ev(T.STUDENT_TRANSFERRED_OUT, { studentId: 1 })).group).toBeNull()
    expect(describe1(ev(T.STUDENT_TRANSFERRED_OUT, { studentId: 1 })).title).toBe(tt('studentTransferredOut'))
  })

  it('createdByName becomes the actor, reason the note', () => {
    const r = describe1(ev(T.PAUSE, { createdByName: 'Admin', reason: 'x' }))
    expect(r.actor).toBe('Admin')
    expect(r.note).toBe('x')
    expect(describe1(ev(T.GROUP_CREATED)).actor).toBeNull()
  })

  it('a past event is not planned', () => {
    const r = describe1(ev(T.GROUP_CREATED, {}, '2026-10-01'))
    expect(r.planned).toBe(false)
    expect(r.badge).toBeNull()
  })

  it('a future event is planned with a neutral badge', () => {
    const r = describe1(ev(T.TEACHER_CHANGED, {}, '2026-12-01'))
    expect(r.planned).toBe(true)
    expect(r.badge).toEqual({ text: t('groups.timeline.planned'), variant: 'neutral' })
  })

  it('group_started in the future uses the planned title', () => {
    expect(describe1(ev(T.GROUP_STARTED, {}, '2026-12-01')).title).toBe(tt('groupStartPlanned'))
    expect(describe1(ev(T.GROUP_STARTED, {}, '2026-10-01')).title).toBe(tt('groupStarted'))
  })

  it('group_end_planned is always planned, even on a past date', () => {
    const r = describe1(ev(T.GROUP_END_PLANNED, {}, '2026-10-01'))
    expect(r.title).toBe(tt('groupEndPlanned'))
    expect(r.planned).toBe(true)
    expect(r.badge?.text).toBe(t('groups.timeline.planned'))
  })

  it('an unknown type falls back to the backend title', () => {
    const r = describe1(ev('something_new' as T, {}, '2026-10-01', 'Backend sarlavha'))
    expect(r.title).toBe('Backend sarlavha')
    expect(r.tone).toBe(TimelineTone.NEUTRAL)
  })
})
