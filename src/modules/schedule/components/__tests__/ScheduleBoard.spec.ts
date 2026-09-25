import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ScheduleBoard from '../ScheduleBoard.vue'
import { WeekDay } from '@/modules/groups/enums/week-day.enum'
import { GroupStatus } from '@/modules/groups/enums/group-status.enum'
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
    top: 72,
    height: 104,
    lane: 0,
    lanes: 1,
    overlap: false,
    ...overrides,
  }
}

const hourMarks = [
  { label: '08:00', top: 0 },
  { label: '09:00', top: 72 },
]

describe('ScheduleBoard', () => {
  it('renders a header cell per column with the room name', () => {
    const columns: BoardColumn[] = [
      { key: 'room-1', id: 1, name: '101-xona', items: [] },
      { key: 'room-2', id: 2, name: '102-xona', items: [] },
    ]
    const wrapper = mount(ScheduleBoard, { props: { columns, gridHeight: 864, hourMarks } })

    expect(wrapper.text()).toContain('101-xona')
    expect(wrapper.text()).toContain('102-xona')
  })

  it('renders a lesson block per item showing time range + group name + teacher name', () => {
    const item = makeItem({
      lesson: makeLesson({ startTime: '09:00', endTime: '10:30', groupName: 'Frontend-1', teacherName: 'Aziz Karimov' }),
    })
    const columns: BoardColumn[] = [{ key: 'room-1', id: 1, name: '101', items: [item] }]
    const wrapper = mount(ScheduleBoard, { props: { columns, gridHeight: 864, hourMarks } })

    const text = wrapper.text()
    expect(text).toContain('09:00–10:30')
    expect(text).toContain('Frontend-1')
    expect(text).toContain('Aziz Karimov')
  })

  it('applies danger classes to an overlapping block and primary classes to a non-overlapping one', () => {
    const overlapping = makeItem({
      lesson: makeLesson({ groupId: 1, startTime: '09:00', endTime: '10:00' }),
      overlap: true,
    })
    const clean = makeItem({
      lesson: makeLesson({ groupId: 2, startTime: '11:00', endTime: '12:00' }),
      overlap: false,
    })
    const columns: BoardColumn[] = [{ key: 'room-1', id: 1, name: '101', items: [overlapping, clean] }]
    const wrapper = mount(ScheduleBoard, { props: { columns, gridHeight: 864, hourMarks } })

    const blocks = wrapper.findAll('.absolute.overflow-hidden')
    expect(blocks).toHaveLength(2)
    expect(blocks[0]!.classes().join(' ')).toContain('border-danger')
    expect(blocks[0]!.classes().join(' ')).toContain('bg-danger')
    expect(blocks[1]!.classes().join(' ')).toContain('border-primary')
    expect(blocks[1]!.classes().join(' ')).toContain('bg-primary')
  })
})
