import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiSpinner from '../UiSpinner.vue'

describe('UiSpinner', () => {
  it('renders an accessible status svg', () => {
    const wrapper = mount(UiSpinner)
    const svg = wrapper.get('svg')
    expect(svg.attributes('role')).toBe('status')
    expect(svg.classes()).toContain('animate-spin')
  })

  it('applies the size prop', () => {
    const wrapper = mount(UiSpinner, { props: { size: 28 } })
    const svg = wrapper.get('svg')
    expect(svg.attributes('width')).toBe('28')
    expect(svg.attributes('height')).toBe('28')
  })
})
