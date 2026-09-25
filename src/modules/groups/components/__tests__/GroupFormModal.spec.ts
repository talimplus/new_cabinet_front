import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import GroupFormModal from '../GroupFormModal.vue'
import { CONFLICT_CHECK_DELAY } from '../../composables/use-schedule-conflicts'
import { checkScheduleConflicts } from '@/modules/schedule/api/schedule.api'
import { ScheduleConflictReason } from '@/modules/schedule/enums/schedule-conflict-reason.enum'
import { WeekDay } from '../../enums/week-day.enum'
import { t } from '@/locales'
import type { Group } from '../../interfaces/group.interface'
import type { ScheduleConflict } from '@/modules/schedule/interfaces/schedule-conflict.interface'

// The composable pulls select options through these fetchers — stub them so the
// centerId watcher's loadFor() resolves without touching the network.
vi.mock('@/modules/subjects/api/subjects.api', () => ({
  fetchSubjects: vi.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
}))
vi.mock('@/modules/rooms/api/rooms.api', () => ({
  fetchRooms: vi.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
}))
vi.mock('@/modules/users/api/users.api', () => ({
  fetchEmployees: vi.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
}))
vi.mock('@/modules/schedule/api/schedule.api', () => ({
  checkScheduleConflicts: vi.fn(),
}))

const mockedCheck = vi.mocked(checkScheduleConflicts)

function makeGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: 14,
    name: 'A1 guruh',
    monthlyFee: 500000,
    lessonDurationMinutes: 90,
    center: { id: 7, name: 'Markaz' },
    subject: { id: 3, name: 'Ingliz tili' },
    room: { id: 4, name: '101' },
    teacher: { id: 9, firstName: 'Ali', lastName: 'Valiyev' },
    schedules: [{ day: WeekDay.MONDAY, startTime: '10:00' }],
    ...overrides,
  }
}

function makeConflict(overrides: Partial<ScheduleConflict> = {}): ScheduleConflict {
  return {
    reason: ScheduleConflictReason.ROOM,
    day: WeekDay.MONDAY,
    requestedStartTime: '10:00',
    requestedEndTime: '11:30',
    groupId: 99,
    groupName: 'Boshqa guruh',
    startTime: '10:00',
    endTime: '11:30',
    roomId: 4,
    roomName: '101',
    teacherId: null,
    teacherName: null,
    ...overrides,
  }
}

function findButton(label: string): HTMLButtonElement {
  const button = Array.from(document.body.querySelectorAll('button')).find(
    (b) => b.textContent?.trim() === label,
  )
  if (!button) throw new Error(`button not found: ${label}`)
  return button
}

async function openModal(editing: Group) {
  // UiModal teleports its content to <body> — assert on the real DOM (see
  // SyllabusFormModal.spec.ts for the same pattern).
  const wrapper = mount(GroupFormModal, {
    attachTo: document.body,
    props: { modelValue: false, editing: null, defaultCenterId: 1 },
  })
  // The reset-on-open watch is not immediate — flip modelValue to trigger it.
  await wrapper.setProps({ modelValue: true, editing })
  await flushPromises()
  vi.advanceTimersByTime(CONFLICT_CHECK_DELAY)
  await flushPromises()
  return wrapper
}

describe('GroupFormModal — live schedule-conflict check', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('disables Save and blocks submit while a conflict is reported', async () => {
    mockedCheck.mockResolvedValueOnce([makeConflict()])
    const wrapper = await openModal(makeGroup())

    expect(document.body.textContent).toContain(t('schedule.conflict.title'))
    const saveButton = findButton(t('common.save'))
    expect(saveButton.disabled).toBe(true)

    saveButton.click()
    await flushPromises()

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('enables Save and lets submit through once the check comes back clean', async () => {
    mockedCheck.mockResolvedValueOnce([])
    const wrapper = await openModal(makeGroup())

    expect(document.body.textContent).toContain(t('schedule.conflict.free'))
    const saveButton = findButton(t('common.save'))
    expect(saveButton.disabled).toBe(false)

    saveButton.click()
    await flushPromises()

    expect(wrapper.emitted('submit')).toHaveLength(1)
  })
})
