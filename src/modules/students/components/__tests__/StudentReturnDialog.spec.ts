import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import StudentReturnDialog from '../StudentReturnDialog.vue'
import { UiSelect, UiTextarea, UiButton, UiDatepicker } from '@/shared/components'
import { StudentStatus } from '../../enums/student-status.enum'
import { ReturnLikelihood } from '../../enums/return-likelihood.enum'

const last = (events: unknown[][] | undefined) =>
  events ? events[events.length - 1] : undefined

const mountOpts = { global: { stubs: { teleport: true } } }

function confirmButton(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAllComponents(UiButton).find((b) => b.text() === 'Tasdiqlash')!
}

describe('StudentReturnDialog', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('emits confirm with the chosen likelihood and comment', async () => {
    const wrapper = mount(StudentReturnDialog, {
      props: { modelValue: true },
      ...mountOpts,
    })

    wrapper.findComponent(UiSelect).vm.$emit('update:modelValue', ReturnLikelihood.MAYBE)
    wrapper.findComponent(UiTextarea).vm.$emit('update:modelValue', 'qaytadi')
    await wrapper.vm.$nextTick()

    await confirmButton(wrapper).trigger('click')

    expect(last(wrapper.emitted('confirm'))).toEqual([
      { returnLikelihood: ReturnLikelihood.MAYBE, comment: 'qaytadi' },
    ])
  })

  it('resets its fields each time it opens', async () => {
    const wrapper = mount(StudentReturnDialog, {
      props: { modelValue: false },
      ...mountOpts,
    })

    // Open, fill in values.
    await wrapper.setProps({ modelValue: true })
    wrapper.findComponent(UiSelect).vm.$emit('update:modelValue', ReturnLikelihood.SURE)
    wrapper.findComponent(UiTextarea).vm.$emit('update:modelValue', 'izoh')
    await wrapper.vm.$nextTick()

    // Close and reopen → fields reset.
    await wrapper.setProps({ modelValue: false })
    await wrapper.setProps({ modelValue: true })

    await confirmButton(wrapper).trigger('click')

    // Empty likelihood/comment collapse to undefined in the payload.
    expect(last(wrapper.emitted('confirm'))).toEqual([
      { returnLikelihood: undefined, comment: undefined },
    ])
  })

  it('asks no stop date when ignoring', () => {
    const wrapper = mount(StudentReturnDialog, { props: { modelValue: true, status: StudentStatus.IGNORED }, ...mountOpts })
    expect(wrapper.findComponent(UiDatepicker).exists()).toBe(false)
  })

  it('STOPPED: sends a past stop date, but not today (the backend default)', async () => {
    const wrapper = mount(StudentReturnDialog, { props: { modelValue: true, status: StudentStatus.STOPPED }, ...mountOpts })
    const picker = wrapper.findComponent(UiDatepicker)
    expect(picker.exists()).toBe(true)

    await confirmButton(wrapper).trigger('click')
    expect(last(wrapper.emitted('confirm'))![0]).toMatchObject({ stopDate: undefined })

    picker.vm.$emit('update:modelValue', new Date(2026, 9, 12))
    await wrapper.vm.$nextTick()
    await confirmButton(wrapper).trigger('click')
    expect(last(wrapper.emitted('confirm'))![0]).toMatchObject({ stopDate: '2026-10-12' })
  })
})
