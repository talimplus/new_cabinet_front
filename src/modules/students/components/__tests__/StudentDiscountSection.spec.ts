import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import StudentDiscountSection from '../StudentDiscountSection.vue'
import StudentDiscountFields from '../StudentDiscountFields.vue'
import StudentFreeMonthsField from '../StudentFreeMonthsField.vue'
import { UiSwitch } from '@/shared/components'
import { t } from '@/locales'

describe('StudentDiscountSection', () => {
  it('is closed by default — no tabs, no fields', () => {
    const wrapper = mount(StudentDiscountSection)

    expect(wrapper.findComponent(UiSwitch).props('modelValue')).toBe(false)
    expect(wrapper.find('[role="tablist"]').exists()).toBe(false)
    expect(wrapper.findComponent(StudentDiscountFields).exists()).toBe(false)
  })

  it('emits enabled when the switch is flipped', async () => {
    const wrapper = mount(StudentDiscountSection)
    await wrapper.get('button[role="switch"]').trigger('click')
    expect(wrapper.emitted('update:enabled')?.[0]).toEqual([true])
  })

  it('shows the discounts tab first and the free months on the second tab', async () => {
    const wrapper = mount(StudentDiscountSection, { props: { enabled: true, freeMonths: 0 } })

    expect(wrapper.findComponent(StudentDiscountFields).exists()).toBe(true)
    const freeTab = wrapper.findAll('[role="tab"]').find((b) => b.text() === t('students.form.discountTabs.free'))!
    await freeTab.trigger('click')
    await flushPromises()

    expect(wrapper.findComponent(StudentDiscountFields).exists()).toBe(false)
    expect(wrapper.findComponent(StudentFreeMonthsField).exists()).toBe(true)
  })
})
