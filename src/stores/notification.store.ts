import { defineStore } from 'pinia'
import { ref } from 'vue'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import type { Notification } from '@/shared/interfaces/notification.interface'

/**
 * Global toast/snackbar queue. The http interceptor pushes error toasts here;
 * screens use `success()` etc. for feedback. Consecutive identical messages are
 * de-duplicated (same behavior as the old cabinet_front snackbar).
 */
export const useNotificationStore = defineStore('notification', () => {
  const items = ref<Notification[]>([])
  let seq = 0

  function push(type: NotificationType, message: string, timeout = 4000): number {
    const last = items.value[items.value.length - 1]
    if (last && last.type === type && last.message === message) return last.id

    const id = ++seq
    items.value.push({ id, type, message, timeout })
    if (timeout > 0) setTimeout(() => remove(id), timeout)
    return id
  }

  function remove(id: number): void {
    const i = items.value.findIndex((n) => n.id === id)
    if (i !== -1) items.value.splice(i, 1)
  }

  const success = (message: string, timeout?: number) =>
    push(NotificationType.SUCCESS, message, timeout)
  const error = (message: string, timeout?: number) =>
    push(NotificationType.ERROR, message, timeout)
  const warning = (message: string, timeout?: number) =>
    push(NotificationType.WARNING, message, timeout)
  const info = (message: string, timeout?: number) => push(NotificationType.INFO, message, timeout)

  return { items, push, remove, success, error, warning, info }
})
