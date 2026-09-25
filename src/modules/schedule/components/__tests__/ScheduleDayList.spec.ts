import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ScheduleDayList from '../ScheduleDayList.vue'
import { WeekDay } from '@/modules/groups/enums/week-day.enum'
import { GroupStatus } from '@/modules/groups/enums/group-status.enum'
import { t } from '@/locales'
import type { BoardColumn, PositionedLesson } from '../../composables/use-schedule'
import type { ScheduleLesson } from '../../interfaces/schedule-board.interface'

function makeLesson(overrides: Partial<ScheduleLesson> = {}): ScheduleLesson {
  return {
    groupId: 1,
    groupName: 'Frontend-1',
    groupStatus: GroupStatus.STARTED,
    day: WeekDay.MONDAY,
    startTime: '09:00',
    endTime: '10:30',
    durationMinutes: 90,
    roomId: 1,
    roomName: '101',
    teacherId: 5,
    teacherName: 'Aziz Karimov',
    subjectId: 3,
    subjectName: 'Frontend',
    ...overrides,
  }
}

function makeItem(overrides: Partial<PositionedLesson> = {}): PositionedLesson {
  return {
    lesson: makeLesson(),
    top: 0,
    height: 0,
    lane: 0,
    lanes: 1,
    overlap: false,
    ...overrides,
  }
}

describe('ScheduleDayList', () => {
  it('flattens all columns into one list sorted ascending by startTime', () => {
    const late = makeItem({ lesson: makeLesson({ groupId: 1, groupName: 'Late', startTime: '14:00', endTime: '15:00' }) })
    const early = makeItem({ lesson: makeLesson({ groupId: 2, groupName: 'Early', startTime: '09:00', endTime: '10:00' }) })
    const mid = makeItem({ lesson: makeLesson({ groupId: 3, groupName: 'Mid', startTime: '11:00', endTime: '12:00' }) })
    const columns: BoardColumn[] = [
      { key: 'room-1', id: 1, name: '101', items: [late] },
      { key: 'room-2', id: 2, name: '102', items: [early, mid] },
    ]
    const wrapper = mount(ScheduleDayList, { props: { columns } })

    const rows = wrapper.findAll('.rounded-lg')
    expect(rows).toHaveLength(3)
    expect(rows.map((r) => r.text())).toEqual([
      expect.stringContaining('Early'),
      expect.stringContaining('Mid'),
      expect.stringContaining('Late'),
    ])
  })

  it('shows the time range, group name, room name, teacher and subject badges', () => {
    const item = makeItem({
      lesson: makeLesson({
        startTime: '09:00',
        endTime: '10:30',
        groupName: 'Frontend-1',
        roomName: '101',
        teacherName: 'Aziz Karimov',
        subjectName: 'Frontend',
      }),
    })
    const columns: BoardColumn[] = [{ key: 'room-1', id: 1, name: '101', items: [item] }]
    const wrapper = mount(ScheduleDayList, { props: { columns } })

    const text = wrapper.text()
    expect(text).toContain('09:00–10:30')
    expect(text).toContain('Frontend-1')
    expect(text).toContain('101')
    expect(text).toContain('Aziz Karimov')
    expect(text).toContain('Frontend')
  })

  it('falls back to the column name for room-less lessons', () => {
    const item = makeItem({
      lesson: makeLesson({ roomId: null, roomName: null }),
    })
    const columns: BoardColumn[] = [{ key: 'no-room', id: null, name: t('schedule.noRoomColumn'), items: [item] }]
    const wrapper = mount(ScheduleDayList, { props: { columns } })

    expect(wrapper.text()).toContain(t('schedule.noRoomColumn'))
  })

  it('renders the conflict badge and border-danger class for an overlapping item', () => {
    const overlapping = makeItem({ overlap: true })
    const columns: BoardColumn[] = [{ key: 'room-1', id: 1, name: '101', items: [overlapping] }]
    const wrapper = mount(ScheduleDayList, { props: { columns } })

    const row = wrapper.get('.rounded-lg')
    expect(row.text()).toContain(t('schedule.conflict.title'))
    expect(row.classes().join(' ')).toContain('border-danger')
  })

  it('does not render the conflict badge and uses border-border for a non-overlapping item', () => {
    const clean = makeItem({ overlap: false })
    const columns: BoardColumn[] = [{ key: 'room-1', id: 1, name: '101', items: [clean] }]
    const wrapper = mount(ScheduleDayList, { props: { columns } })

    const row = wrapper.get('.rounded-lg')
    expect(row.text()).not.toContain(t('schedule.conflict.title'))
    expect(row.classes().join(' ')).toContain('border-border')
    expect(row.classes().join(' ')).not.toContain('border-danger')
  })
})
