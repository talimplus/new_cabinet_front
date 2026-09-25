import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import StudentDiscountSection from '../StudentDiscountSection.vue'
import StudentDiscountPeriodRow from '../StudentDiscountPeriodRow.vue'

const last = (events: unknown[][] | undefined) =>
  events ? events[events.length - 1] : undefined

describe('StudentDiscountSection', () => {
  it('shows the simple percent + reason inputs when not in periods mode', () => {
    const wrapper = mount(StudentDiscountSection, {
      props: { usePeriods: false, percent: '10', reason: 'sabab' },
    })

    expect(wrapper.text()).toContain('Chegirma %')
    expect(wrapper.text()).toContain('Sabab')
    expect(wrapper.findAllComponents(StudentDiscountPeriodRow)).toHaveLength(0)
  })

  it('seeds one period row and clears the simple fields when toggled to periods mode', async () => {
    const wrapper = mount(StudentDiscountSection, {
      props: { usePeriods: false, percent: '10', reason: 'sabab' },
    })

    await wrapper.find('input[type="checkbox"]').setValue(true)
    await flushPromises()

    expect(last(wrapper.emitted('update:usePeriods'))).toEqual([true])
    // Simple fields cleared.
    expect(last(wrapper.emitted('update:percent'))).toEqual([''])
    expect(last(wrapper.emitted('update:reason'))).toEqual([''])
    // One seeded period row.
    const seeded = last(wrapper.emitted('update:periods'))?.[0] as unknown[]
    expect(seeded).toHaveLength(1)
    expect(wrapper.findAllComponents(StudentDiscountPeriodRow)).toHaveLength(1)
    // Simple inputs are gone in periods mode.
    expect(wrapper.text()).not.toContain('Chegirma %')
  })

  it('adds a row via the button and removes it via the row remove button', async () => {
    const wrapper = mount(StudentDiscountSection, {
      props: { usePeriods: false, percent: '', reason: '' },
    })

    await wrapper.find('input[type="checkbox"]').setValue(true)
    await flushPromises()
    expect(wrapper.findAllComponents(StudentDiscountPeriodRow)).toHaveLength(1)

    // "Period qo'shish" button adds a second row.
    const addBtn = wrapper.findAll('button').find((b) => b.text().includes('Period'))!
    await addBtn.trigger('click')
    await flushPromises()
    expect((last(wrapper.emitted('update:periods'))?.[0] as unknown[])).toHaveLength(2)
    expect(wrapper.findAllComponents(StudentDiscountPeriodRow)).toHaveLength(2)

    // The first row's remove button drops it back to one.
    await wrapper.findAllComponents(StudentDiscountPeriodRow)[0]!.find('button').trigger('click')
    await flushPromises()
    expect((last(wrapper.emitted('update:periods'))?.[0] as unknown[])).toHaveLength(1)
    expect(wrapper.findAllComponents(StudentDiscountPeriodRow)).toHaveLength(1)
  })
})
