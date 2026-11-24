import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import StudentDiscountFields from '../StudentDiscountFields.vue'
import StudentDiscountPeriodRow from '../StudentDiscountPeriodRow.vue'
import { emptyPeriod } from '../../utils/student-discount'
import { UiIconButton } from '@/shared/components'
import { DiscountType } from '../../enums/discount-type.enum'
import { t } from '@/locales'

const last = (events: unknown[][] | undefined) =>
  events ? events[events.length - 1] : undefined

describe('StudentDiscountFields', () => {
  it('shows a permanent row (group select, no months) when not in periods mode', () => {
    const wrapper = mount(StudentDiscountFields, { props: { usePeriods: false, baseDiscounts: [emptyPeriod()] } })

    expect(wrapper.text()).toContain(t('students.form.discountGroup'))
    expect(wrapper.text()).not.toContain(t('students.form.fromMonthShort'))
    expect(wrapper.findComponent(StudentDiscountPeriodRow).props('permanent')).toBe(true)
  })

  it('labels the value as an amount when the type is "amount"', () => {
    const wrapper = mount(StudentDiscountFields, {
      props: { usePeriods: false, baseDiscounts: [{ ...emptyPeriod(), type: DiscountType.AMOUNT, value: '20000' }] },
    })

    expect(wrapper.text()).toContain(t('students.form.discountTypes.amount'))
  })

  it('seeds one period row when toggled to periods mode', async () => {
    const wrapper = mount(StudentDiscountFields, {
      props: { usePeriods: false },
    })

    await wrapper.find('input[type="checkbox"]').setValue(true)
    await flushPromises()

    expect(last(wrapper.emitted('update:usePeriods'))).toEqual([true])
    const seeded = last(wrapper.emitted('update:periods'))?.[0] as unknown[]
    expect(seeded).toHaveLength(1)
    expect(seeded[0]).toMatchObject({ type: DiscountType.PERCENT, value: '', groupId: null })
    expect(wrapper.findAllComponents(StudentDiscountPeriodRow)).toHaveLength(1)
  })

  it('passes the student groups to every period row', async () => {
    const groupOptions = [{ label: 'FRONTEND-1', value: 12 }]
    const wrapper = mount(StudentDiscountFields, {
      props: { usePeriods: false, groupOptions },
    })

    await wrapper.find('input[type="checkbox"]').setValue(true)
    await flushPromises()

    expect(wrapper.findComponent(StudentDiscountPeriodRow).props('groupOptions')).toEqual(groupOptions)
  })

  it('adds a row via the button and removes it via the row remove button', async () => {
    const wrapper = mount(StudentDiscountFields, {
      props: { usePeriods: false },
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
