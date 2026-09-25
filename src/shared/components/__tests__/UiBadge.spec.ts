import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiBadge from '../UiBadge.vue'

describe('UiBadge', () => {
  it('renders slot content', () => {
    const wrapper = mount(UiBadge, { slots: { default: 'Active' } })
    expect(wrapper.text()).toContain('Active')
  })

  it('applies the success variant classes', () => {
    const wrapper = mount(UiBadge, { props: { variant: 'success' } })
    const classes = wrapper.classes().join(' ')
    expect(classes).toContain('bg-success-soft')
    expect(classes).toContain('text-success')
  })

  it('applies the danger variant classes', () => {
    const wrapper = mount(UiBadge, { props: { variant: 'danger' } })
    const classes = wrapper.classes().join(' ')
    expect(classes).toContain('bg-danger-soft')
    expect(classes).toContain('text-danger')
  })

  it('defaults to the neutral variant', () => {
    const wrapper = mount(UiBadge, { slots: { default: 'x' } })
    const classes = wrapper.classes().join(' ')
    expect(classes).toContain('bg-surface-muted')
    expect(classes).toContain('text-muted-foreground')
  })
})
