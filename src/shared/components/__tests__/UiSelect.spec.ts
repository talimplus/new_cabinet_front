import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiSelect from '../UiSelect.vue'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const options: SelectOption[] = [
  { label: 'One', value: 1 },
  { label: 'Two', value: 2 },
]

describe('UiSelect', () => {
  it('mounts with options and renders the label', () => {
    const wrapper = mount(UiSelect, {
      props: { options, label: 'Pick one' },
    })
    expect(wrapper.text()).toContain('Pick one')
    expect(wrapper.find('.ui-multiselect').exists()).toBe(true)
  })

  it('shows the picked labels in multiple mode, not a count', () => {
    const wrapper = mount(UiSelect, {
      props: { options, mode: 'multiple', modelValue: [2, 1] },
    })
    expect(wrapper.get('.multiselect-multiple-label').text()).toBe('One, Two')
  })

  it('keeps picked options in the dropdown, marked as selected', () => {
    const wrapper = mount(UiSelect, {
      props: { options, mode: 'multiple', modelValue: [2] },
    })
    const rendered = wrapper.findAll('.multiselect-option')
    expect(rendered).toHaveLength(2)
    expect(rendered[1]!.classes()).toContain('is-selected')
  })
})
