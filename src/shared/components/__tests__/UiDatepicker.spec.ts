import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import UiDatepicker from '../UiDatepicker.vue'

// Light smoke coverage — @vuepic/vue-datepicker is a heavy 3rd-party widget,
// so we only assert our wrapper's contract (label + field shell), not its internals.
describe('UiDatepicker', () => {
  it('renders the label', () => {
    const wrapper = mount(UiDatepicker, { props: { label: 'Tug‘ilgan sana' } })
    expect(wrapper.text()).toContain('Tug‘ilgan sana')
  })

  it('shows the error message', () => {
    const wrapper = mount(UiDatepicker, { props: { label: 'Sana', error: 'Majburiy' } })
    expect(wrapper.text()).toContain('Majburiy')
  })

  it('forwards minDate / maxDate to the picker', () => {
    const min = new Date(2026, 0, 1)
    const max = new Date(2026, 9, 21)
    const wrapper = mount(UiDatepicker, { props: { minDate: min, maxDate: max } })
    const picker = wrapper.findComponent(VueDatePicker)
    expect(picker.props('minDate')).toEqual(min)
    expect(picker.props('maxDate')).toEqual(max)
  })
})
