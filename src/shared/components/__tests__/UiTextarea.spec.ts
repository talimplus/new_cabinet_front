import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiTextarea from '../UiTextarea.vue'

describe('UiTextarea', () => {
  it('reflects modelValue', () => {
    const wrapper = mount(UiTextarea, { props: { modelValue: 'hello' } })
    expect(wrapper.get('textarea').element.value).toBe('hello')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(UiTextarea)
    await wrapper.get('textarea').setValue('some text')
    const events = wrapper.emitted('update:modelValue') ?? []
    expect(events[events.length - 1]).toEqual(['some text'])
  })

  it('applies the rows prop', () => {
    const wrapper = mount(UiTextarea, { props: { rows: 6 } })
    expect(wrapper.get('textarea').attributes('rows')).toBe('6')
  })

  it('defaults rows to 3', () => {
    const wrapper = mount(UiTextarea)
    expect(wrapper.get('textarea').attributes('rows')).toBe('3')
  })

  it('shows the error prop and marks the field invalid', () => {
    const wrapper = mount(UiTextarea, { props: { error: 'Required' } })
    expect(wrapper.text()).toContain('Required')
    expect(wrapper.get('textarea').classes().join(' ')).toContain('border-danger')
  })
})
