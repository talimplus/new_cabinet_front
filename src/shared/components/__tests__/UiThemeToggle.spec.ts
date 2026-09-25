import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UiThemeToggle from '../UiThemeToggle.vue'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('UiThemeToggle', () => {
  it('renders a button', () => {
    const wrapper = mount(UiThemeToggle)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('toggles the dark class on <html> when clicked', async () => {
    const wrapper = mount(UiThemeToggle)
    const wasDark = document.documentElement.classList.contains('dark')

    await wrapper.get('button').trigger('click')
    expect(document.documentElement.classList.contains('dark')).toBe(!wasDark)

    await wrapper.get('button').trigger('click')
    expect(document.documentElement.classList.contains('dark')).toBe(wasDark)
  })
})
