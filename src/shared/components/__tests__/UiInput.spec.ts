import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiInput from '../UiInput.vue'
import { t } from '@/locales'

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

  it('toggles a password field between hidden and visible', async () => {
    const wrapper = mount(UiInput, { props: { type: 'password', modelValue: 'secret' } })
    const toggle = wrapper.get('button')
    expect(wrapper.get('input').attributes('type')).toBe('password')
    expect(toggle.attributes('aria-label')).toBe(t('common.showPassword'))

    await toggle.trigger('click')
    expect(wrapper.get('input').attributes('type')).toBe('text')
    expect(toggle.attributes('aria-label')).toBe(t('common.hidePassword'))
    expect(wrapper.get('input').element.value).toBe('secret')

    await toggle.trigger('click')
    expect(wrapper.get('input').attributes('type')).toBe('password')
  })

  it('renders no eye toggle for non-password fields', () => {
    expect(mount(UiInput, { props: { type: 'text' } }).find('button').exists()).toBe(false)
  })

  it('disables the eye toggle with the field', () => {
    const wrapper = mount(UiInput, { props: { type: 'password', disabled: true } })
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })
})
