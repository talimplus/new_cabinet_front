import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiFieldShell from '../UiFieldShell.vue'

describe('UiFieldShell', () => {
  it('renders the label and default slot', () => {
    const wrapper = mount(UiFieldShell, {
      props: { label: 'Email' },
      slots: { default: '<input />' },
    })
    expect(wrapper.text()).toContain('Email')
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('marks the label required', () => {
    const wrapper = mount(UiFieldShell, { props: { label: 'Name', required: true } })
    expect(wrapper.text()).toContain('*')
  })

  it('shows the hint when there is no error', () => {
    const wrapper = mount(UiFieldShell, { props: { hint: 'Optional' } })
    expect(wrapper.text()).toContain('Optional')
  })

  it('error takes precedence over hint', () => {
    const wrapper = mount(UiFieldShell, { props: { hint: 'Optional', error: 'Required' } })
    expect(wrapper.text()).toContain('Required')
    expect(wrapper.text()).not.toContain('Optional')
  })
})
