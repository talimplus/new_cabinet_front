import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiPagination from '../UiPagination.vue'

describe('UiPagination', () => {
  it('renders nothing when there is a single page', () => {
    const wrapper = mount(UiPagination, { props: { page: 1, totalPages: 1 } })
    expect(wrapper.find('nav').exists()).toBe(false)
  })

  it('renders numbered page buttons', () => {
    const wrapper = mount(UiPagination, { props: { page: 1, totalPages: 3 } })
    const labels = wrapper.findAll('nav button').map((b) => b.text())
    expect(labels).toContain('1')
    expect(labels).toContain('2')
    expect(labels).toContain('3')
  })

  function lastEmit(wrapper: ReturnType<typeof mount>): unknown[] | undefined {
    const events = wrapper.emitted('update:page') ?? []
    return events[events.length - 1]
  }

  it('emits update:page with the next page when next is clicked', async () => {
    const wrapper = mount(UiPagination, { props: { page: 2, totalPages: 5 } })
    const buttons = wrapper.findAll('nav button')
    await buttons[buttons.length - 1]!.trigger('click')
    expect(lastEmit(wrapper)).toEqual([3])
  })

  it('emits update:page with the previous page when prev is clicked', async () => {
    const wrapper = mount(UiPagination, { props: { page: 3, totalPages: 5 } })
    await wrapper.findAll('nav button')[0]!.trigger('click')
    expect(lastEmit(wrapper)).toEqual([2])
  })

  it('emits update:page with the clicked page number', async () => {
    const wrapper = mount(UiPagination, { props: { page: 1, totalPages: 3 } })
    const two = wrapper.findAll('nav button').find((b) => b.text() === '2')!
    await two.trigger('click')
    expect(lastEmit(wrapper)).toEqual([2])
  })

  it('disables prev on the first page', () => {
    const wrapper = mount(UiPagination, { props: { page: 1, totalPages: 4 } })
    expect(wrapper.findAll('nav button')[0]!.attributes('disabled')).toBeDefined()
  })

  it('disables next on the last page', () => {
    const wrapper = mount(UiPagination, { props: { page: 4, totalPages: 4 } })
    const buttons = wrapper.findAll('nav button')
    expect(buttons[buttons.length - 1]!.attributes('disabled')).toBeDefined()
  })
})
