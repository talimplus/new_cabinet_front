import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount, flushPromises } from '@vue/test-utils'
import GroupPlanTab from '../GroupPlanTab.vue'
import { fetchGroupPlan as fetchGroupPlanApi } from '../../../api/group-plan.api'
import { GroupStatus } from '../../../enums/group-status.enum'
import type { GroupPlan } from '../../../interfaces/group-plan.interface'

vi.mock('../../../api/group-plan.api', () => ({
  fetchGroupPlan: vi.fn(),
  fetchSyllabuses: vi.fn().mockResolvedValue({
    data: [],
    meta: { total: 0, page: 1, perPage: 100, totalPages: 1 },
  }),
  setGroupSyllabus: vi.fn(),
  setLessonTopics: vi.fn(),
  distributePlan: vi.fn(),
}))

const mockedFetchPlan = vi.mocked(fetchGroupPlanApi)

const UiSelectStub = {
  name: 'UiSelect',
  props: ['modelValue', 'options'],
  template: '<div class="ui-select-stub" />',
}

function makePlan(withSyllabus: boolean): GroupPlan {
  return {
    group: {
      id: 12, name: 'G-1', status: GroupStatus.STARTED,
      startDate: null, endDate: null, durationMonths: null,
      subject: { id: 2, name: 'Matematika' },
    },
    syllabus: withSyllabus
      ? { id: 7, name: 'Algebra', description: null, topics: [] }
      : null,
    timezone: 'Asia/Tashkent',
    today: '2026-09-06',
    totalLessons: withSyllabus ? 12 : null,
    horizonDate: null,
    lessons: withSyllabus
      ? [{ lessonNumber: 1, date: '2026-09-07', isPast: false, isToday: false, topics: [] }]
      : [],
  }
}

function mountTab(props: Record<string, unknown>) {
  return mount(GroupPlanTab, {
    props: { groupId: 12, ...props },
    global: { stubs: { UiSelect: UiSelectStub } },
  })
}

describe('GroupPlanTab', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('shows the empty state with the attach control when canEdit and no syllabus', async () => {
    mockedFetchPlan.mockResolvedValue(makePlan(false))
    const wrapper = mountTab({ canEdit: true, subjectId: 2 })
    await flushPromises()

    expect(wrapper.text()).toContain('biriktirilmagan')
    expect(wrapper.text()).toContain('Biriktirish')
    expect(wrapper.find('.ui-select-stub').exists()).toBe(true)
  })

  it('hides the attach control in the empty state when canEdit is false', async () => {
    mockedFetchPlan.mockResolvedValue(makePlan(false))
    const wrapper = mountTab({ canEdit: false })
    await flushPromises()

    expect(wrapper.text()).toContain('biriktirilmagan')
    expect(wrapper.find('.ui-select-stub').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Biriktirish')
  })

  it('renders the attached plan header and edit actions when canEdit', async () => {
    mockedFetchPlan.mockResolvedValue(makePlan(true))
    const wrapper = mountTab({ canEdit: true })
    await flushPromises()

    expect(wrapper.text()).toContain('Algebra')
    expect(wrapper.text()).toContain('Taqsimlash')
    expect(wrapper.text()).toContain('Almashtirish')
    expect(wrapper.text()).toContain('Uzish')
  })

  it('hides edit actions on the attached plan when canEdit is false', async () => {
    mockedFetchPlan.mockResolvedValue(makePlan(true))
    const wrapper = mountTab({ canEdit: false })
    await flushPromises()

    expect(wrapper.text()).toContain('Algebra')
    expect(wrapper.text()).not.toContain('Taqsimlash')
    expect(wrapper.text()).not.toContain('Almashtirish')
  })
})
