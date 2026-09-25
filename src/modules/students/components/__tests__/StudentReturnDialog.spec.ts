import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentReturnDialog from '../StudentReturnDialog.vue'
import { UiSelect, UiTextarea, UiButton } from '@/shared/components'
import { ReturnLikelihood } from '../../enums/return-likelihood.enum'

const last = (events: unknown[][] | undefined) =>
  events ? events[events.length - 1] : undefined

const mountOpts = { global: { stubs: { teleport: true } } }

function confirmButton(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAllComponents(UiButton).find((b) => b.text() === 'Tasdiqlash')!
}

describe('StudentReturnDialog', () => {
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
})
