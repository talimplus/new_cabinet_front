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
})
