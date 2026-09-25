import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UiConfirmDialog from '../UiConfirmDialog.vue'
import { t } from '@/locales'

afterEach(() => {
  document.body.innerHTML = ''
})

function mountDialog(props: Record<string, unknown> = {}) {
  return mount(UiConfirmDialog, {
    attachTo: document.body,
    props: {
      modelValue: true,
      title: 'Delete group',
      message: 'Are you sure?',
      ...props,
    },
  })
}

function footerButtons(): HTMLButtonElement[] {
  return Array.from(document.body.querySelectorAll('footer button, [class*="footer"] button, button'))
}

describe('UiConfirmDialog', () => {
  it('renders the title and message when open', () => {
    mountDialog()
    expect(document.body.textContent).toContain('Delete group')
    expect(document.body.textContent).toContain('Are you sure?')
  })

  it('does not render content when closed', () => {
    mountDialog({ modelValue: false })
    expect(document.body.textContent).not.toContain('Are you sure?')
  })

  it('uses the danger variant class on the confirm button when variant="danger"', () => {
    mountDialog({ variant: 'danger' })
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const confirmButton = buttons.find((b) => b.textContent?.includes(t('common.confirm')))
    expect(confirmButton).toBeTruthy()
    expect(confirmButton?.className).toContain('bg-danger')
  })

  it('does not use the danger class with the default (primary) variant', () => {
    mountDialog()
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const confirmButton = buttons.find((b) => b.textContent?.includes(t('common.confirm')))
    expect(confirmButton?.className).not.toContain('bg-danger')
  })

  it('clicking confirm emits confirm only', async () => {
    const wrapper = mountDialog()
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const confirmButton = buttons.find((b) => b.textContent?.includes(t('common.confirm')))
    confirmButton?.dispatchEvent(new Event('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('clicking cancel emits update:modelValue=false and cancel', async () => {
    const wrapper = mountDialog()
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const cancelButton = buttons.find((b) => b.textContent?.includes(t('common.cancel')))
    cancelButton?.dispatchEvent(new Event('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    const events = wrapper.emitted('update:modelValue') ?? []
    expect(events[events.length - 1]).toEqual([false])
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('disables the cancel button and shows the confirm button as loading while loading', () => {
    mountDialog({ loading: true })
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const cancelButton = buttons.find((b) => b.textContent?.includes(t('common.cancel'))) as HTMLButtonElement
    expect(cancelButton.disabled).toBe(true)
    const confirmButton = buttons.find((b) => b.textContent?.includes(t('common.confirm')))
    // UiButton renders a spinner element when :loading is true.
    expect(confirmButton?.querySelector('svg, [class*="spin"]')).toBeTruthy()
  })

  it('renders custom confirm/cancel labels when provided', () => {
    mountDialog({ confirmLabel: 'Ha, tugat', cancelLabel: 'Yoq' })
    expect(document.body.textContent).toContain('Ha, tugat')
    expect(document.body.textContent).toContain('Yoq')
  })
})
