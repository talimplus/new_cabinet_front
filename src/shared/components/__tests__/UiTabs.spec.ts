import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiTabs from '../UiTabs.vue'
import { t } from '@/locales'
import type { TabItem } from '@/shared/interfaces/tab-item.interface'

const tabs: TabItem[] = [
  { key: 'overview', labelKey: 'staff.tabs.overview' },
  { key: 'deductions', labelKey: 'staff.tabs.deductions', badge: 3 },
  { key: 'receipts', labelKey: 'staff.tabs.receipts', badge: 2, badgeAlert: true },
]

function mountTabs(modelValue = 'overview', items: TabItem[] = tabs) {
  return mount(UiTabs, { props: { tabs: items, modelValue } })
}

describe('UiTabs', () => {
  it('renders one button per tab with the translated label', () => {
    const wrapper = mountTabs()
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
    expect(buttons[0]!.text()).toContain(t('staff.tabs.overview'))
    expect(buttons[1]!.text()).toContain(t('staff.tabs.deductions'))
    expect(buttons[2]!.text()).toContain(t('staff.tabs.receipts'))
  })

  it('marks the active tab with text-primary and aria-selected true', () => {
    const wrapper = mountTabs('deductions')
    const buttons = wrapper.findAll('button')
    expect(buttons[1]!.classes().join(' ')).toContain('text-primary')
    expect(buttons[1]!.attributes('aria-selected')).toBe('true')
    expect(buttons[0]!.attributes('aria-selected')).toBe('false')
    expect(buttons[0]!.classes().join(' ')).not.toContain('text-primary')
  })

  it('renders a badge only when truthy', () => {
    const wrapper = mountTabs()
    const buttons = wrapper.findAll('button')
    expect(buttons[0]!.findComponent({ name: 'UiBadge' }).exists()).toBe(false)
    expect(buttons[1]!.findComponent({ name: 'UiBadge' }).exists()).toBe(true)
    expect(buttons[1]!.text()).toContain('3')
  })

  it('draws the badge in the danger variant when badgeAlert is set', () => {
    const wrapper = mountTabs()
    const buttons = wrapper.findAll('button')
    const neutralBadge = buttons[1]!.findComponent({ name: 'UiBadge' })
    expect(neutralBadge.props('variant')).toBe('neutral')

    const alertBadge = buttons[2]!.findComponent({ name: 'UiBadge' })
    expect(alertBadge.props('variant')).toBe('danger')
  })

  it('emits update:modelValue with the clicked tab key', async () => {
    const wrapper = mountTabs('overview')
    await wrapper.findAll('button')[2]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['receipts'])
  })

  it('de-emphasises a muted tab that is not selected', () => {
    const mutedTabs: TabItem[] = [
      { key: 'aug', labelKey: 'common.months.08', muted: true },
      { key: 'sep', labelKey: 'common.months.09' },
    ]
    const wrapper = mountTabs('sep', mutedTabs)
    const buttons = wrapper.findAll('button')
    expect(buttons[0]!.classes().join(' ')).toContain('opacity-60')
    expect(buttons[1]!.classes().join(' ')).not.toContain('opacity-60')
  })

  it('does not dim a muted tab when it is the selected one', () => {
    const mutedTabs: TabItem[] = [{ key: 'aug', labelKey: 'common.months.08', muted: true }]
    const wrapper = mountTabs('aug', mutedTabs)
    expect(wrapper.findAll('button')[0]!.classes().join(' ')).not.toContain('opacity-60')
  })
})
