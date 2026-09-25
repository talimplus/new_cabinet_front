import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GroupScheduleConflicts from '../GroupScheduleConflicts.vue'
import { t } from '@/locales'

function mountConflicts(props: Record<string, unknown> = {}) {
  return mount(GroupScheduleConflicts, {
    props: { checking: false, messages: [], free: false, ...props },
  })
}

describe('GroupScheduleConflicts', () => {
  it('shows the checking message while checking', () => {
    const wrapper = mountConflicts({ checking: true })
    expect(wrapper.text()).toContain(t('schedule.conflict.checking'))
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('renders an alert with the title, one <li> per message, and the hint', () => {
    const messages = ['Xona 101 band', 'O‘qituvchi band']
    const wrapper = mountConflicts({ messages })

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain(t('schedule.conflict.title'))
    expect(alert.text()).toContain(t('schedule.conflict.hint'))

    const items = wrapper.findAll('li')
    expect(items).toHaveLength(2)
    expect(items[0]?.text()).toBe('Xona 101 band')
    expect(items[1]?.text()).toBe('O‘qituvchi band')
  })

  it('shows the free message when a check ran clean', () => {
    const wrapper = mountConflicts({ free: true })
    expect(wrapper.text()).toContain(t('schedule.conflict.free'))
  })

  it('renders nothing when idle (not checking, no messages, not free)', () => {
    const wrapper = mountConflicts()
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('prioritizes the checking state over messages/free', () => {
    const wrapper = mountConflicts({ checking: true, messages: ['x'], free: true })
    expect(wrapper.text()).toContain(t('schedule.conflict.checking'))
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain(t('schedule.conflict.free'))
  })
})
