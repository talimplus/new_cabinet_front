import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GroupChangeDates from '../GroupChangeDates.vue'
import { t } from '@/locales'

const UiDatepickerStub = {
  name: 'UiDatepicker',
  props: ['modelValue', 'label', 'error'],
  emits: ['update:modelValue'],
  template: '<div class="dp-stub">{{ label }}<span class="err">{{ error }}</span></div>',
}

function mountDates(scheduleChanged: boolean, error?: string) {
  return mount(GroupChangeDates, {
    props: { scheduleChanged, scheduleFrom: null, error },
    global: { stubs: { UiDatepicker: UiDatepickerStub } },
  })
}

describe('GroupChangeDates', () => {
  it('renders nothing when the schedule did not change', () => {
    const wrapper = mountDates(false)
    expect(wrapper.find('.dp-stub').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  it('renders the schedule datepicker when the schedule changed', () => {
    const pickers = mountDates(true).findAll('.dp-stub')
    expect(pickers).toHaveLength(1)
    expect(pickers[0]!.text()).toContain(t('groups.form.scheduleEffectiveFrom'))
  })

  it('passes the field error to the picker', () => {
    expect(mountDates(true, 'Xato').find('.err').text()).toBe('Xato')
  })

  it('re-emits the picked date as update:scheduleFrom (unwrapping an array)', () => {
    const wrapper = mountDates(true)
    const d = new Date(2026, 9, 5)
    wrapper.findComponent(UiDatepickerStub).vm.$emit('update:modelValue', [d])
    expect(wrapper.emitted('update:scheduleFrom')).toEqual([[d]])
  })
})
