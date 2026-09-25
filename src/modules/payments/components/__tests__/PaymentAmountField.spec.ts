import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PaymentAmountField from '../PaymentAmountField.vue'
import { t } from '@/locales'
import { formatSom } from '@/shared/utils/format-money'

const last = (events: unknown[][] | undefined) => (events ? events[events.length - 1] : undefined)

describe('PaymentAmountField', () => {
  it('shows the payable ceiling in the hint by default', () => {
    const wrapper = mount(PaymentAmountField, { props: { modelValue: null, payable: 400000 } })
    expect(wrapper.text()).toContain(`${t('payments.table.remaining')}: ${formatSom(400000)}`)
  })

  it('shows the "calculated" hint and disables the input when locked', () => {
    const wrapper = mount(PaymentAmountField, {
      props: { modelValue: 400000, payable: 400000, locked: true },
    })
    expect(wrapper.text()).toContain(t('payments.dialog.calcHint'))
    expect(wrapper.text()).not.toContain(t('payments.table.remaining'))
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('is not disabled when not locked and not explicitly disabled', () => {
    const wrapper = mount(PaymentAmountField, { props: { modelValue: null, payable: 400000 } })
    expect(wrapper.find('input').attributes('disabled')).toBeUndefined()
  })

  it('emits update:modelValue as a number when typing', async () => {
    const wrapper = mount(PaymentAmountField, { props: { modelValue: null, payable: 400000 } })
    await wrapper.find('input').setValue(150000)
    expect(last(wrapper.emitted('update:modelValue'))).toEqual([150000])
  })

  it('emits null when the field is cleared', async () => {
    const wrapper = mount(PaymentAmountField, { props: { modelValue: 150000, payable: 400000 } })
    await wrapper.find('input').setValue('')
    expect(last(wrapper.emitted('update:modelValue'))).toEqual([null])
  })
})
