import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiButton from '../UiButton.vue'

describe('UiButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(UiButton, { slots: { default: 'Save' } })
    expect(wrapper.text()).toContain('Save')
  })

  it('applies the variant classes', () => {
    const wrapper = mount(UiButton, { props: { variant: 'danger' } })
    expect(wrapper.classes().join(' ')).toContain('bg-danger')
  })

  it('is disabled and shows a spinner while loading', () => {
    const wrapper = mount(UiButton, { props: { loading: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.find('svg[role="status"]').exists()).toBe(true)
  })

  it('emits click when enabled', async () => {
    const wrapper = mount(UiButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('sets the native button type', () => {
    const wrapper = mount(UiButton, { props: { type: 'submit' } })
    expect(wrapper.attributes('type')).toBe('submit')
  })
})
