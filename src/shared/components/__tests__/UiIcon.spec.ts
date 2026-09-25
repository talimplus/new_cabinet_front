import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiIcon from '../UiIcon.vue'
import { Search } from '@/shared/icons'

describe('UiIcon', () => {
  it('renders the passed icon as an svg', () => {
    const wrapper = mount(UiIcon, { props: { icon: Search } })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('applies the size', () => {
    const wrapper = mount(UiIcon, { props: { icon: Search, size: 32 } })
    const svg = wrapper.get('svg')
    expect(svg.attributes('width')).toBe('32')
    expect(svg.attributes('height')).toBe('32')
  })
})
