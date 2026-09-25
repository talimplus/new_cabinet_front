import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import UiToaster from '../UiToaster.vue'
import { useNotificationStore } from '@/stores/notification.store'

describe('UiToaster', () => {
  beforeEach(() => setActivePinia(createPinia()))
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders queued notifications from the store', () => {
    const store = useNotificationStore()
    store.success('Saqlandi', 0)
    mount(UiToaster, { attachTo: document.body })
    expect(document.body.innerHTML).toContain('Saqlandi')
    expect(document.body.querySelector('[role="alert"]')).not.toBeNull()
  })

  it('removes a notification when its close button is clicked', async () => {
    const store = useNotificationStore()
    store.error('Xato', 0)
    mount(UiToaster, { attachTo: document.body })
    const btn = document.body.querySelector('[role="alert"] button') as HTMLButtonElement
    btn.click()
    await Promise.resolve()
    expect(store.items).toHaveLength(0)
  })
})
