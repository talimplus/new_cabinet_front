import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiSwitch from '../UiSwitch.vue'

describe('UiSwitch', () => {
  it('renders an accessible switch reflecting the value', () => {
    const wrapper = mount(UiSwitch, { props: { modelValue: true, label: 'Discount' } })
    const btn = wrapper.get('button[role="switch"]')
    expect(btn.attributes('aria-checked')).toBe('true')
    expect(btn.attributes('aria-label')).toBe('Discount')
    expect(btn.classes().join(' ')).toContain('bg-primary')
  })

  it('emits the toggled value on click', async () => {
    const wrapper = mount(UiSwitch, { props: { modelValue: false } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('does not toggle when disabled', async () => {
    const wrapper = mount(UiSwitch, { props: { modelValue: false, disabled: true } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
