import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiInput from '../UiInput.vue'

describe('UiInput', () => {
  it('renders the label and reflects modelValue', () => {
    const wrapper = mount(UiInput, { props: { label: 'Email', modelValue: 'a@b.uz' } })
    expect(wrapper.text()).toContain('Email')
    expect(wrapper.get('input').element.value).toBe('a@b.uz')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(UiInput)
    await wrapper.get('input').setValue('hello')
    const events = wrapper.emitted('update:modelValue') ?? []
    expect(events[events.length - 1]).toEqual(['hello'])
  })

  it('emits a number when type=number', async () => {
    const wrapper = mount(UiInput, { props: { type: 'number' } })
    await wrapper.get('input').setValue('42')
    const events = wrapper.emitted('update:modelValue') ?? []
    expect(events[events.length - 1]).toEqual([42])
  })

  it('shows the error prop and marks the field invalid', () => {
    const wrapper = mount(UiInput, { props: { error: 'Required' } })
    expect(wrapper.text()).toContain('Required')
    expect(wrapper.get('input').classes().join(' ')).toContain('border-danger')
  })

  it('marks the label required', () => {
    const wrapper = mount(UiInput, { props: { label: 'Name', required: true } })
    expect(wrapper.text()).toContain('*')
  })

  // `readonly` must reach the <input>, not fall through to the field wrapper —
  // a generated link the user only copies has to stay uneditable.
  it('puts readonly on the input itself', () => {
    expect(mount(UiInput, { props: { readonly: true } }).get('input').attributes('readonly'))
      .toBeDefined()
    expect(mount(UiInput).get('input').attributes('readonly')).toBeUndefined()
  })
})
