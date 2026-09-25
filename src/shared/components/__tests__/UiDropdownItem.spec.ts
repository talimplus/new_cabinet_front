import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiDropdownItem from '../UiDropdownItem.vue'

describe('UiDropdownItem', () => {
  it('renders slot content with menuitem role', () => {
    const wrapper = mount(UiDropdownItem, { slots: { default: 'Edit' } })
    expect(wrapper.text()).toContain('Edit')
    expect(wrapper.attributes('role')).toBe('menuitem')
  })

  it('applies danger styling', () => {
    const wrapper = mount(UiDropdownItem, { props: { danger: true } })
    expect(wrapper.classes().join(' ')).toContain('text-danger')
  })

  it('disables the item', () => {
    const wrapper = mount(UiDropdownItem, { props: { disabled: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('emits click when pressed', async () => {
    const wrapper = mount(UiDropdownItem)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
