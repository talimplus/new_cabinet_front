import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import UiMoneyInput from '../UiMoneyInput.vue'
import UiForm from '../UiForm.vue'

const last = (w: { emitted: (e: string) => unknown[][] | undefined }) => {
  const all = w.emitted('update:modelValue') ?? []
  return all[all.length - 1]
}
const value = (w: ReturnType<typeof mount>) => (w.get('input').element as HTMLInputElement).value

describe('UiMoneyInput', () => {
  it('groups thousands while typing and emits a plain number', async () => {
    const wrapper = mount(UiMoneyInput, { props: { label: 'Summa' } })
    await wrapper.get('input').setValue('100000')
    expect(value(wrapper)).toBe('100 000')
    expect(last(wrapper)).toEqual([100000])
    expect(wrapper.text()).toContain('Summa')
  })

  it('accepts spaces, a comma decimal and drops letters', async () => {
    const wrapper = mount(UiMoneyInput)
    await wrapper.get('input').setValue('1 250 000,5 so‘m')
    expect(value(wrapper)).toBe('1 250 000.5')
    expect(last(wrapper)).toEqual([1250000.5])
  })

  it('keeps a trailing decimal point while it is being typed', async () => {
    const wrapper = mount(UiMoneyInput)
    await wrapper.get('input').setValue('1000.')
    expect(value(wrapper)).toBe('1 000.')
    expect(last(wrapper)).toEqual([1000])
  })

  it('emits "" when cleared, like UiInput type=number', async () => {
    const wrapper = mount(UiMoneyInput, { props: { modelValue: 5000 } })
    await wrapper.get('input').setValue('')
    expect(last(wrapper)).toEqual([''])
  })

  it('formats a value set from outside, including a numeric string', async () => {
    const wrapper = mount(UiMoneyInput, { props: { modelValue: '500000.00' } })
    expect(value(wrapper)).toBe('500 000')
    await wrapper.setProps({ modelValue: 1200000 })
    expect(value(wrapper)).toBe('1 200 000')
    await wrapper.setProps({ modelValue: '' })
    expect(value(wrapper)).toBe('')
  })

  it('uses a numeric keyboard, no browser autocomplete, and renders the suffix slot', () => {
    const wrapper = mount(UiMoneyInput, { slots: { suffix: 'so‘m' } })
    expect(wrapper.get('input').attributes('inputmode')).toBe('decimal')
    expect(wrapper.get('input').attributes('autocomplete')).toBe('off')
    expect(wrapper.text()).toContain('so‘m')
  })

  it('shows the error and disables the field', () => {
    const wrapper = mount(UiMoneyInput, { props: { error: 'Bad', disabled: true } })
    expect(wrapper.text()).toContain('Bad')
    expect(wrapper.get('input').classes().join(' ')).toContain('border-danger')
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
  })

  it('registers with a surrounding UiForm through `name`', async () => {
    const wrapper = mount({
      components: { UiForm, UiMoneyInput },
      template: `<UiForm ref="form" :initial-values="{ amount: 2000 }"><UiMoneyInput name="amount" /></UiForm>`,
    })
    await nextTick()
    expect(value(wrapper)).toBe('2 000')
    await wrapper.get('input').setValue('35000')
    await nextTick()
    expect((wrapper.vm.$refs.form as { values: Record<string, unknown> }).values.amount).toBe(35000)
  })
})
