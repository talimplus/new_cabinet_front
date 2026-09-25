import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import UiCollapse from '../UiCollapse.vue'

/** The most recent payload of an emitted event (`.at()` needs a newer lib). */
function lastEmit(events: unknown[][] | undefined): unknown[] | undefined {
  return events?.[events.length - 1]
}

describe('UiCollapse', () => {
  it('renders the title and starts collapsed', () => {
    const wrapper = mount(UiCollapse, {
      props: { title: 'Ruxsatlar' },
      slots: { default: '<p>ichki</p>' },
    })

    expect(wrapper.text()).toContain('Ruxsatlar')
    expect(wrapper.text()).not.toContain('ichki')
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
  })

  it('expands and collapses on click', async () => {
    const wrapper = mount(UiCollapse, {
      props: { title: 'T' },
      slots: { default: '<p>ichki</p>' },
    })

    await wrapper.get('button').trigger('click')
    expect(wrapper.text()).toContain('ichki')
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')

    await wrapper.get('button').trigger('click')
    expect(wrapper.text()).not.toContain('ichki')
  })

  it('honours a controlled open model', async () => {
    const wrapper = mount(UiCollapse, {
      props: { title: 'T', open: true },
      slots: { default: '<p>ichki</p>' },
    })
    expect(wrapper.text()).toContain('ichki')

    await wrapper.get('button').trigger('click')
    expect(lastEmit(wrapper.emitted('update:open'))).toEqual([false])
  })

  it('renders the title and meta slots', () => {
    const wrapper = mount(UiCollapse, {
      slots: { title: '<span>Sarlavha</span>', meta: '<span>3 / 7</span>' },
    })
    expect(wrapper.text()).toContain('Sarlavha')
    expect(wrapper.text()).toContain('3 / 7')
  })

  it('rotates the chevron when open', async () => {
    const wrapper = mount(UiCollapse, { props: { title: 'T' } })
    expect(wrapper.html()).not.toContain('rotate-180')

    await wrapper.get('button').trigger('click')
    expect(wrapper.html()).toContain('rotate-180')
  })

  it('keeps the header tappable on mobile (min 44px)', () => {
    const wrapper = mount(UiCollapse, { props: { title: 'T' } })
    expect(wrapper.get('button').classes().join(' ')).toContain('min-h-11')
  })
})
