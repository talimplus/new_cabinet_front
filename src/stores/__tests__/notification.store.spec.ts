import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '../notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'

describe('notification store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('pushes a typed notification', () => {
    const store = useNotificationStore()
    store.success('Saved')
    expect(store.items).toHaveLength(1)
    expect(store.items[0]).toMatchObject({ type: NotificationType.SUCCESS, message: 'Saved' })
  })

  it('de-duplicates consecutive identical messages', () => {
    const store = useNotificationStore()
    store.error('Oops')
    store.error('Oops')
    expect(store.items).toHaveLength(1)
  })

  it('auto-dismisses after the timeout', () => {
    const store = useNotificationStore()
    store.info('Hi', 1000)
    expect(store.items).toHaveLength(1)
    vi.advanceTimersByTime(1000)
    expect(store.items).toHaveLength(0)
  })

  it('removes by id', () => {
    const store = useNotificationStore()
    const id = store.warning('Careful', 0)
    store.remove(id)
    expect(store.items).toHaveLength(0)
  })
})
