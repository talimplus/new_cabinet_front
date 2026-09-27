import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import StudentDiscountSection from '../StudentDiscountSection.vue'
import StudentDiscountPeriodRow from '../StudentDiscountPeriodRow.vue'
import { UiIconButton } from '@/shared/components'
import { DiscountType } from '../../enums/discount-type.enum'
import { t } from '@/locales'

const last = (events: unknown[][] | undefined) =>
  events ? events[events.length - 1] : undefined

describe('StudentDiscountSection', () => {
  it('shows the type, value and reason inputs when not in periods mode', () => {
    const wrapper = mount(StudentDiscountSection, {
      props: { usePeriods: false, type: DiscountType.PERCENT, value: '10', reason: 'sabab' },
    })

    expect(wrapper.text()).toContain(t('students.form.discountType'))
    expect(wrapper.text()).toContain(t('students.form.discountTypes.percent'))
    expect(wrapper.text()).toContain(t('students.form.reason'))
    expect(wrapper.findAllComponents(StudentDiscountPeriodRow)).toHaveLength(0)
  })

  it('labels the value as an amount when the type is "amount"', () => {
    const wrapper = mount(StudentDiscountSection, {
      props: { usePeriods: false, type: DiscountType.AMOUNT, value: '20000', reason: '' },
    })

    expect(wrapper.text()).toContain(t('students.form.discountTypes.amount'))
  })

  it('seeds one period row and clears the simple fields when toggled to periods mode', async () => {
    const wrapper = mount(StudentDiscountSection, {
      props: { usePeriods: false, type: DiscountType.PERCENT, value: '10', reason: 'sabab' },
    })

    await wrapper.find('input[type="checkbox"]').setValue(true)
    await flushPromises()

    expect(last(wrapper.emitted('update:usePeriods'))).toEqual([true])
    expect(last(wrapper.emitted('update:value'))).toEqual([''])
    expect(last(wrapper.emitted('update:reason'))).toEqual([''])
    const seeded = last(wrapper.emitted('update:periods'))?.[0] as unknown[]
    expect(seeded).toHaveLength(1)
    expect(seeded[0]).toMatchObject({ type: DiscountType.PERCENT, value: '', groupId: null })
    expect(wrapper.findAllComponents(StudentDiscountPeriodRow)).toHaveLength(1)
  })

  it('passes the student groups to every period row', async () => {
    const groupOptions = [{ label: 'FRONTEND-1', value: 12 }]
    const wrapper = mount(StudentDiscountSection, {
      props: { usePeriods: false, type: DiscountType.PERCENT, value: '', reason: '', groupOptions },
    })

    await wrapper.find('input[type="checkbox"]').setValue(true)
    await flushPromises()

    expect(wrapper.findComponent(StudentDiscountPeriodRow).props('groupOptions')).toEqual(groupOptions)
  })

  it('adds a row via the button and removes it via the row remove button', async () => {
    const wrapper = mount(StudentDiscountSection, {
      props: { usePeriods: false, type: DiscountType.PERCENT, value: '', reason: '' },
    })

    await wrapper.find('input[type="checkbox"]').setValue(true)
    await flushPromises()
    expect(wrapper.findAllComponents(StudentDiscountPeriodRow)).toHaveLength(1)

    const addBtn = wrapper.findAll('button').find((b) => b.text().includes(t('students.form.addPeriod')))!
    await addBtn.trigger('click')
    await flushPromises()
    expect(last(wrapper.emitted('update:periods'))?.[0] as unknown[]).toHaveLength(2)
    expect(wrapper.findAllComponents(StudentDiscountPeriodRow)).toHaveLength(2)

    const firstRow = wrapper.findAllComponents(StudentDiscountPeriodRow)[0]!
    await firstRow.findComponent(UiIconButton).trigger('click')
    await flushPromises()
    expect(last(wrapper.emitted('update:periods'))?.[0] as unknown[]).toHaveLength(1)
    expect(wrapper.findAllComponents(StudentDiscountPeriodRow)).toHaveLength(1)
  })
})
