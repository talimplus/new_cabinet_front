import type { NotificationType } from '@/shared/enums/notification-type.enum'

export interface Notification {
  id: number
  type: NotificationType
  message: string
  /** Auto-dismiss delay in ms; 0 keeps it until dismissed manually. */
  timeout: number
}
