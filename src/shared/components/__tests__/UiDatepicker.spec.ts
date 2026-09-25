import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
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
})
