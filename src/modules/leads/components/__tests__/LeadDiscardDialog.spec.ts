import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LeadDiscardDialog from '../LeadDiscardDialog.vue'
import { UiTextarea, UiButton } from '@/shared/components'

const last = (events: unknown[][] | undefined) =>
  events ? events[events.length - 1] : undefined

const mountOpts = { global: { stubs: { teleport: true } } }

function confirmButton(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAllComponents(UiButton).find((b) => b.text() === 'Qiziqmadi')!
}

describe('LeadDiscardDialog', () => {
  it('emits confirm with the trimmed reason', async () => {
    const wrapper = mount(LeadDiscardDialog, {
      props: { modelValue: true },
      ...mountOpts,
    })

    wrapper.findComponent(UiTextarea).vm.$emit('update:modelValue', '  Qiziqmadi  ')
    await wrapper.vm.$nextTick()

    await confirmButton(wrapper).trigger('click')

    expect(last(wrapper.emitted('confirm'))).toEqual(['Qiziqmadi'])
  })

  it('emits an empty reason when nothing was typed', async () => {
    const wrapper = mount(LeadDiscardDialog, {
      props: { modelValue: true },
      ...mountOpts,
    })

    await confirmButton(wrapper).trigger('click')

    expect(last(wrapper.emitted('confirm'))).toEqual([''])
  })

  it('resets the reason each time it reopens', async () => {
    const wrapper = mount(LeadDiscardDialog, {
      props: { modelValue: false },
      ...mountOpts,
    })

    await wrapper.setProps({ modelValue: true })
    wrapper.findComponent(UiTextarea).vm.$emit('update:modelValue', 'eski sabab')
    await wrapper.vm.$nextTick()

    await wrapper.setProps({ modelValue: false })
    await wrapper.setProps({ modelValue: true })

    await confirmButton(wrapper).trigger('click')

    expect(last(wrapper.emitted('confirm'))).toEqual([''])
  })
})
