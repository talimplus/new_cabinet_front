import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentFilters from '../StudentFilters.vue'
import { StudentPreferredTime } from '../../enums/student-preferred-time.enum'
import { ReturnLikelihood } from '../../enums/return-likelihood.enum'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const last = (events: unknown[][] | undefined) =>
  events ? events[events.length - 1] : undefined

// Deterministic stub for the real select (mirrors DashboardFilters.spec style).
const UiSelectStub = {
  name: 'UiSelect',
  props: ['modelValue', 'options', 'mode', 'searchable', 'placeholder'],
  emits: ['update:modelValue'],
  template: '<div class="ui-select-stub" :data-ph="placeholder"></div>',
}

const subjectOptions: SelectOption[] = [{ label: 'Matematika', value: 7 }]

function mountFilters(props: Record<string, unknown> = {}) {
  return mount(StudentFilters, {
    props: { subjectOptions, ...props },
    global: { stubs: { UiSelect: UiSelectStub } },
  })
}

describe('StudentFilters', () => {
  it('renders only the filters enabled by the show* props', () => {
    expect(
      mountFilters({ showSubject: true }).findAllComponents({ name: 'UiSelect' }),
    ).toHaveLength(1)

    const all = mountFilters({
      showSubject: true,
      showPreferredTime: true,
      showPreferredDays: true,
      showReturnLikelihood: true,
    })
    expect(all.findAllComponents({ name: 'UiSelect' })).toHaveLength(4)
  })

  it('emits change and update:subjectId when the subject filter changes', async () => {
    const wrapper = mountFilters({ showSubject: true })
    wrapper.findComponent({ name: 'UiSelect' }).vm.$emit('update:modelValue', 7)
    await wrapper.vm.$nextTick()

    expect(last(wrapper.emitted('update:subjectId'))).toEqual([7])
    expect(wrapper.emitted('change')).toHaveLength(1)
  })

  it('emits change and update:preferredTime with the enum value', async () => {
    const wrapper = mountFilters({ showPreferredTime: true })
    wrapper.findComponent({ name: 'UiSelect' }).vm.$emit(
      'update:modelValue',
      StudentPreferredTime.MORNING,
    )
    await wrapper.vm.$nextTick()

    expect(last(wrapper.emitted('update:preferredTime'))).toEqual([
      StudentPreferredTime.MORNING,
    ])
    expect(wrapper.emitted('change')).toHaveLength(1)
  })

  it('emits change and update:returnLikelihood with the enum value', async () => {
    const wrapper = mountFilters({ showReturnLikelihood: true })
    wrapper.findComponent({ name: 'UiSelect' }).vm.$emit(
      'update:modelValue',
      ReturnLikelihood.SURE,
    )
    await wrapper.vm.$nextTick()

    expect(last(wrapper.emitted('update:returnLikelihood'))).toEqual([
      ReturnLikelihood.SURE,
    ])
    expect(wrapper.emitted('change')).toHaveLength(1)
  })
})
