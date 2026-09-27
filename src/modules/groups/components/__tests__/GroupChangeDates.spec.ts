import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GroupChangeDates from '../GroupChangeDates.vue'
import { t } from '@/locales'

const UiDatepickerStub = {
  name: 'UiDatepicker',
  props: ['modelValue', 'label'],
  emits: ['update:modelValue'],
  template: '<div class="dp-stub">{{ label }}</div>',
}

function mountDates(scheduleChanged: boolean, teacherChanged: boolean) {
  return mount(GroupChangeDates, {
    props: { scheduleChanged, teacherChanged, scheduleFrom: null, teacherFrom: null },
    global: { stubs: { UiDatepicker: UiDatepickerStub } },
  })
}

describe('GroupChangeDates', () => {
  it('renders nothing when neither the schedule nor the teacher changed', () => {
    const wrapper = mountDates(false, false)
    expect(wrapper.find('.dp-stub').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  it('renders only the schedule datepicker when the schedule changed', () => {
    const wrapper = mountDates(true, false)
    const pickers = wrapper.findAll('.dp-stub')
    expect(pickers).toHaveLength(1)
    expect(pickers[0]!.text()).toBe(t('groups.form.scheduleEffectiveFrom'))
  })

  it('renders only the teacher datepicker when the teacher changed', () => {
    const wrapper = mountDates(false, true)
    const pickers = wrapper.findAll('.dp-stub')
    expect(pickers).toHaveLength(1)
    expect(pickers[0]!.text()).toBe(t('groups.form.teacherEffectiveFrom'))
  })

  it('renders both datepickers when both changed', () => {
    expect(mountDates(true, true).findAll('.dp-stub')).toHaveLength(2)
  })

  it('re-emits the picked date as update:scheduleFrom / update:teacherFrom', async () => {
    const wrapper = mountDates(true, true)
    const [schedule, teacher] = wrapper.findAllComponents(UiDatepickerStub)
    const d = new Date(2026, 9, 5)

    schedule!.vm.$emit('update:modelValue', d)
    teacher!.vm.$emit('update:modelValue', [d])

    expect(wrapper.emitted('update:scheduleFrom')).toEqual([[d]])
    expect(wrapper.emitted('update:teacherFrom')).toEqual([[d]])
  })
})
