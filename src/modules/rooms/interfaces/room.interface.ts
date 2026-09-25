import type { Center } from '@/modules/centers/interfaces/center.interface'

export interface Room {
  id: number
  name: string
  centerId?: number
  center?: Center
}
