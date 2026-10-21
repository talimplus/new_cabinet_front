import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TimelineLinkText from '../TimelineLinkText.vue'

const RouterLink = { props: ['to'], template: '<a class="rl" :data-to="JSON.stringify(to)"><slot /></a>' }
const mountIt = (link: { text: string; to: unknown }) =>
  mount(TimelineLinkText, { props: { link: link as never }, global: { stubs: { RouterLink } } })

describe('TimelineLinkText', () => {
  it('renders a router link when `to` is set', () => {
    const w = mountIt({ text: 'Ali', to: { name: 'student-card', params: { id: 1 } } })
    const a = w.get('a.rl')
    expect(a.text()).toBe('Ali')
    expect(JSON.parse(a.attributes('data-to')!)).toEqual({ name: 'student-card', params: { id: 1 } })
  })

  it('renders plain text when `to` is null', () => {
    const w = mountIt({ text: 'Ali', to: null })
    expect(w.find('a').exists()).toBe(false)
    expect(w.text()).toBe('Ali')
  })
})
