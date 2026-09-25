import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import UiCheckbox from '../UiCheckbox.vue'

/** The most recent payload of an emitted event (`.at()` needs a newer lib). */
function lastEmit(events: unknown[][] | undefined): unknown[] | undefined {
  return events?.[events.length - 1]
}

describe('UiCheckbox', () => {
  it('renders the label prop', () => {
    const wrapper = mount(UiCheckbox, { props: { label: 'Accept terms' } })
    expect(wrapper.text()).toContain('Accept terms')
  })

  it('renders the default slot over the label prop', () => {
    const wrapper = mount(UiCheckbox, {
      props: { label: 'Ignored' },
      slots: { default: 'Custom label' },
    })
    expect(wrapper.text()).toContain('Custom label')
  })

  it('reflects modelValue on the checkbox', () => {
    const wrapper = mount(UiCheckbox, { props: { modelValue: true } })
    expect((wrapper.get('input[type="checkbox"]').element as HTMLInputElement).checked).toBe(true)
  })

  it('emits update:modelValue when toggled on', async () => {
    const wrapper = mount(UiCheckbox, { props: { modelValue: false } })
    await wrapper.get('input[type="checkbox"]').setValue(true)
    const events = wrapper.emitted('update:modelValue') ?? []
    expect(events[events.length - 1]).toEqual([true])
  })

  it('emits update:modelValue when toggled off', async () => {
    const wrapper = mount(UiCheckbox, { props: { modelValue: true } })
    await wrapper.get('input[type="checkbox"]').setValue(false)
    const events = wrapper.emitted('update:modelValue') ?? []
    expect(events[events.length - 1]).toEqual([false])
  })

  it('disables the input when disabled', () => {
    const wrapper = mount(UiCheckbox, { props: { disabled: true } })
    expect(wrapper.get('input[type="checkbox"]').attributes('disabled')).toBeDefined()
  })

  describe('indeterminate', () => {
    it('shows the dash instead of the tick', () => {
      const wrapper = mount(UiCheckbox, { props: { modelValue: true, indeterminate: true } })
      const icons = wrapper.findAll('svg')
      // Check is hidden, Minus is shown.
      expect(icons[0]!.attributes('style')).toContain('display: none')
      expect(icons[1]!.attributes('style') ?? '').not.toContain('display: none')
    })

    it('still emits the plain checked value when clicked', async () => {
      const wrapper = mount(UiCheckbox, { props: { modelValue: false, indeterminate: true } })
      await wrapper.get('input').setValue(true)
      expect(lastEmit(wrapper.emitted('update:modelValue'))).toEqual([true])
    })

    it('tints the box like a checked one', () => {
      const wrapper = mount(UiCheckbox, { props: { modelValue: false, indeterminate: true } })
      expect(wrapper.html()).toContain('bg-primary')
    })
  })
})
