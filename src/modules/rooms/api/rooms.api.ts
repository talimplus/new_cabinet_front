import { http } from '@/shared/api/http'
import type { Room } from '../interfaces/room.interface'
import type { RoomForm } from '../interfaces/room-form.interface'
import type { RoomsParams } from '../interfaces/room-params.interface'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'

/** Rooms are center-scoped and unpaginated; the server still wraps them in { data, meta }. */
export async function fetchRooms(params: RoomsParams): Promise<PaginatedResponse<Room>> {
  const { data } = await http.get<PaginatedResponse<Room>>('/rooms', { params })
  return data
}

export async function createRoom(form: RoomForm): Promise<Room> {
  const { data } = await http.post<Room>('/rooms', form)
  return data
}

export async function updateRoom(id: number, form: RoomForm): Promise<Room> {
  const { data } = await http.put<Room>(`/rooms/${id}`, form)
  return data
}

export async function deleteRoom(id: number): Promise<void> {
  await http.delete(`/rooms/${id}`)
}
