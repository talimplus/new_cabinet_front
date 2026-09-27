import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import AbsencesFilters from '../AbsencesFilters.vue'
import { UiInput, UiSelect } from '@/shared/components'
import { AttendanceStatus } from '@/modules/groups/enums/attendance-status.enum'
import { FollowUpFilter } from '../../enums/follow-up-filter.enum'
import type { AbsencesFilters as Filters } from '../../composables/use-absences'
import { t } from '@/locales'

// UiInput order: from, to, search. UiSelect order: teacher, group, status, followUp.
const INPUT = { from: 0, to: 1, search: 2 }
const SELECT = { teacher: 0, group: 1, status: 2, followUp: 3 }

function makeFilters(overrides: Partial<Filters> = {}): Filters {
  return {
    from: '2026-09-17',
    to: '2026-09-24',
    groupId: null,
    teacherId: null,
    status: null,
    followUp: FollowUpFilter.PENDING,
    search: '',
    page: 1,
    perPage: 20,
    ...overrides,
  }
}

function mountFilters(filters: Filters) {
  return mount(AbsencesFilters, {
    props: {
      filters,
      groupOptions: [{ label: 'English A1', value: 3 }],
      teacherOptions: [{ label: 'Olim Karimov', value: 10 }],
    },
  })
}

describe('AbsencesFilters', () => {
  it('renders all filter labels', () => {
    const wrapper = mountFilters(reactive(makeFilters()))
    const text = wrapper.text()
    for (const key of ['from', 'to', 'teacher', 'group', 'status', 'followUp', 'search']) {
      expect(text).toContain(t(`absences.filter.${key}`))
    }
    expect(wrapper.findAllComponents(UiInput)).toHaveLength(3)
    expect(wrapper.findAllComponents(UiSelect)).toHaveLength(4)
  })

  it('changing "from" emits change with the new date (props untouched)', async () => {
    const filters = reactive(makeFilters())
    const wrapper = mountFilters(filters)
    await wrapper.findAllComponents(UiInput)[INPUT.from]!.vm.$emit('update:modelValue', '2026-08-01')

    expect(wrapper.emitted('change')?.[0]).toEqual([{ from: '2026-08-01' }])
    expect(filters.from).toBe('2026-09-17')
  })

  it('changing "to" emits change with the new date', async () => {
    const wrapper = mountFilters(reactive(makeFilters()))
    await wrapper.findAllComponents(UiInput)[INPUT.to]!.vm.$emit('update:modelValue', '2026-09-30')

    expect(wrapper.emitted('change')?.[0]).toEqual([{ to: '2026-09-30' }])
  })

  it('teacher select emits teacher with the id and does not mutate filters', async () => {
    const filters = reactive(makeFilters())
    const wrapper = mountFilters(filters)
    await wrapper.findAllComponents(UiSelect)[SELECT.teacher]!.vm.$emit('update:modelValue', 10)

    expect(wrapper.emitted('teacher')?.[0]).toEqual([10])
    expect(filters.teacherId).toBeNull()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('clearing the teacher select emits teacher with null', async () => {
    const wrapper = mountFilters(reactive(makeFilters({ teacherId: 10 })))
    await wrapper.findAllComponents(UiSelect)[SELECT.teacher]!.vm.$emit('update:modelValue', null)

    expect(wrapper.emitted('teacher')?.[0]).toEqual([null])
  })

  it('group select emits change with the groupId', async () => {
    const wrapper = mountFilters(reactive(makeFilters()))
    await wrapper.findAllComponents(UiSelect)[SELECT.group]!.vm.$emit('update:modelValue', 3)

    expect(wrapper.emitted('change')?.[0]).toEqual([{ groupId: 3 }])
  })

  it('status select emits the status, and "all" maps to null', async () => {
    const wrapper = mountFilters(reactive(makeFilters()))
    const select = wrapper.findAllComponents(UiSelect)[SELECT.status]!

    await select.vm.$emit('update:modelValue', AttendanceStatus.EXCUSED)
    await select.vm.$emit('update:modelValue', 'all')
    expect(wrapper.emitted('change')).toEqual([
      [{ status: AttendanceStatus.EXCUSED }],
      [{ status: null }],
    ])
  })

  it('follow-up select emits change with the filter', async () => {
    const wrapper = mountFilters(reactive(makeFilters()))
    await wrapper.findAllComponents(UiSelect)[SELECT.followUp]!.vm.$emit('update:modelValue', FollowUpFilter.DONE)

    expect(wrapper.emitted('change')?.[0]).toEqual([{ followUp: FollowUpFilter.DONE }])
  })

  it('search input emits search with the text (not change)', async () => {
    const wrapper = mountFilters(reactive(makeFilters()))
    await wrapper.findAllComponents(UiInput)[INPUT.search]!.vm.$emit('update:modelValue', 'Ali')

    expect(wrapper.emitted('search')?.[0]).toEqual(['Ali'])
    expect(wrapper.emitted('change')).toBeUndefined()
  })
})
