import type { Center } from '@/modules/centers/interfaces/center.interface'

export interface Subject {
  id: number
  name: string
  center?: Center
  createdAt?: string
}
