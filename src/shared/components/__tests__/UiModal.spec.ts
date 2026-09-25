import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'

import UiModal from '../UiModal.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('UiModal', () => {
  it('does not render content when modelValue is false', () => {
    mount(UiModal, {
      props: { modelValue: false },
      slots: { default: 'Modal body' },
      attachTo: document.body,
    })
    expect(document.body.innerHTML).not.toContain('Modal body')
  })

  it('renders content, title, and footer when open', () => {
    mount(UiModal, {
      props: { modelValue: true, title: 'My title' },
      slots: { default: 'Modal body', footer: 'Footer here' },
      attachTo: document.body,
    })
    expect(document.body.innerHTML).toContain('Modal body')
    expect(document.body.innerHTML).toContain('My title')
    expect(document.body.innerHTML).toContain('Footer here')
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
  })

  it('emits update:modelValue=false when the close button is clicked', async () => {
    const wrapper = mount(UiModal, {
      props: { modelValue: true, title: 'X' },
      attachTo: document.body,
    })
    const closeBtn = document.body.querySelector('header button') as HTMLButtonElement
    expect(closeBtn).not.toBeNull()
    closeBtn.click()
    await wrapper.vm.$nextTick()
    const events = wrapper.emitted('update:modelValue') ?? []
    expect(events[events.length - 1]).toEqual([false])
  })

  it('closes on Escape when closable', async () => {
    const wrapper = mount(UiModal, {
      props: { modelValue: true, closable: true },
      attachTo: document.body,
    })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    const events = wrapper.emitted('update:modelValue') ?? []
    expect(events[events.length - 1]).toEqual([false])
  })

  it('does not close on Escape when not closable', async () => {
    const wrapper = mount(UiModal, {
      props: { modelValue: true, closable: false },
      attachTo: document.body,
    })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
