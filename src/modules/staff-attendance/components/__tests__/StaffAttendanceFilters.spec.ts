import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import StaffAttendanceFilters from '../StaffAttendanceFilters.vue'
import { UiInput, UiSelect, UiCheckbox } from '@/shared/components'
import { t } from '@/locales'

interface Filters {
  from: string
  to: string
  userId: number | null
  onlyLate: boolean
  onlyFlagged: boolean
}

function makeFilters(overrides: Partial<Filters> = {}): Filters {
  return { from: '2026-09-01', to: '2026-09-24', userId: null, onlyLate: false, onlyFlagged: false, ...overrides }
}

function mountFilters(filters: Filters, isLog: boolean) {
  return mount(StaffAttendanceFilters, {
    props: { filters: reactive(filters), employees: [{ label: 'Ali Valiyev', value: 10 }], isLog },
  })
}

describe('StaffAttendanceFilters', () => {
  it('renders the from/to date inputs', () => {
    const wrapper = mountFilters(makeFilters(), true)
    expect(wrapper.findAllComponents(UiInput)).toHaveLength(2)
    expect(wrapper.text()).toContain(t('staffAttendance.filter.from'))
    expect(wrapper.text()).toContain(t('staffAttendance.filter.to'))
  })

  it('changing "from" mutates filters and emits reload', async () => {
    const filters = makeFilters()
    const wrapper = mountFilters(filters, true)
    await wrapper.findAllComponents(UiInput)[0]!.vm.$emit('update:modelValue', '2026-08-01')

    expect(filters.from).toBe('2026-08-01')
    expect(wrapper.emitted('reload')).toHaveLength(1)
  })

  it('changing "to" mutates filters and emits reload', async () => {
    const filters = makeFilters()
    const wrapper = mountFilters(filters, true)
    await wrapper.findAllComponents(UiInput)[1]!.vm.$emit('update:modelValue', '2026-09-30')

    expect(filters.to).toBe('2026-09-30')
    expect(wrapper.emitted('reload')).toHaveLength(1)
  })

  describe('when isLog is true', () => {
    it('renders the employee select and the two checkboxes', () => {
      const wrapper = mountFilters(makeFilters(), true)
      expect(wrapper.findComponent(UiSelect).exists()).toBe(true)
      expect(wrapper.findAllComponents(UiCheckbox)).toHaveLength(2)
      expect(wrapper.text()).toContain(t('staffAttendance.filter.onlyLate'))
      expect(wrapper.text()).toContain(t('staffAttendance.filter.onlyFlagged'))
    })

    it('changing the employee select mutates userId and emits reloadLog', async () => {
      const filters = makeFilters()
      const wrapper = mountFilters(filters, true)
      await wrapper.findComponent(UiSelect).vm.$emit('update:modelValue', 10)

      expect(filters.userId).toBe(10)
      expect(wrapper.emitted('reloadLog')).toHaveLength(1)
    })

    it('toggling onlyLate mutates filters and emits reloadLog', async () => {
      const filters = makeFilters()
      const wrapper = mountFilters(filters, true)
      await wrapper.findAllComponents(UiCheckbox)[0]!.vm.$emit('update:modelValue', true)

      expect(filters.onlyLate).toBe(true)
      expect(wrapper.emitted('reloadLog')).toHaveLength(1)
    })

    it('toggling onlyFlagged mutates filters and emits reloadLog', async () => {
      const filters = makeFilters()
      const wrapper = mountFilters(filters, true)
      await wrapper.findAllComponents(UiCheckbox)[1]!.vm.$emit('update:modelValue', true)

      expect(filters.onlyFlagged).toBe(true)
      expect(wrapper.emitted('reloadLog')).toHaveLength(1)
    })
  })

  describe('when isLog is false', () => {
    it('does not render the employee select or the checkboxes', () => {
      const wrapper = mountFilters(makeFilters(), false)
      expect(wrapper.findComponent(UiSelect).exists()).toBe(false)
      expect(wrapper.findAllComponents(UiCheckbox)).toHaveLength(0)
      expect(wrapper.text()).not.toContain(t('staffAttendance.filter.onlyLate'))
      expect(wrapper.text()).not.toContain(t('staffAttendance.filter.onlyFlagged'))
    })
  })
})
