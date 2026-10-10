import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentFreeMonthsField from '../StudentFreeMonthsField.vue'
import { UiSelect } from '@/shared/components'
import { formatDate } from '@/shared/utils/format-date'
import { t } from '@/locales'

const window = { from: '2026-10-17', untilExclusive: '2026-11-17' }

describe('StudentFreeMonthsField', () => {
  it('offers none and 1–3 months, none first', () => {
    const wrapper = mount(StudentFreeMonthsField, { props: { freeMonths: 0 } })
    const options = wrapper.findComponent(UiSelect).props('options') as { value: number }[]
    expect(options.map((o) => o.value)).toEqual([0, 1, 2, 3])
  })

  it('emits the picked count', () => {
    const wrapper = mount(StudentFreeMonthsField, { props: { freeMonths: 0 } })
    wrapper.findComponent(UiSelect).vm.$emit('update:modelValue', 2)
    expect(wrapper.emitted('update:freeMonths')?.[0]).toEqual([2])
  })

  it('shows the stored window with its last free day', () => {
    const wrapper = mount(StudentFreeMonthsField, { props: { freeMonths: 1, storedMonths: 1, window } })
    expect(wrapper.text()).toContain(
      t('students.form.freeWindow', { from: formatDate('2026-10-17'), to: formatDate('2026-11-16') }),
    )
  })

  it('hides the window once the count differs from the stored one', () => {
    const wrapper = mount(StudentFreeMonthsField, { props: { freeMonths: 2, storedMonths: 1, window } })
    expect(wrapper.text()).not.toContain(formatDate('2026-11-16'))
  })
})
