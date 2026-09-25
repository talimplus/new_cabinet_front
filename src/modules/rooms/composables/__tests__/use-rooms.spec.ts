import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useRooms } from '../use-rooms'
import {
  fetchRooms as fetchRoomsApi,
  createRoom as createRoomApi,
  updateRoom as updateRoomApi,
  deleteRoom as deleteRoomApi,
} from '../../api/rooms.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import type { Room } from '../../interfaces/room.interface'
import type { RoomForm } from '../../interfaces/room-form.interface'

vi.mock('../../api/rooms.api', () => ({
  fetchRooms: vi.fn(),
  createRoom: vi.fn(),
  updateRoom: vi.fn(),
  deleteRoom: vi.fn(),
}))

const mockedFetchRooms = vi.mocked(fetchRoomsApi)
const mockedCreateRoom = vi.mocked(createRoomApi)
const mockedUpdateRoom = vi.mocked(updateRoomApi)
const mockedDeleteRoom = vi.mocked(deleteRoomApi)

const CENTER_ID = 5

function makeRoom(overrides: Partial<Room> = {}): Room {
  return { id: 1, name: 'Room 101', centerId: CENTER_ID, ...overrides }
}

const form: RoomForm = { name: 'Room 202', centerId: CENTER_ID }

describe('useRooms', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetchRooms.mockResolvedValue({
      data: [makeRoom()],
      meta: { total: 1, page: 1, perPage: 10, totalPages: 1 },
    })
  })

  describe('init()/load()', () => {
    it('fetches with name: undefined and populates rows from response.data', async () => {
      const s = useRooms()
      await s.init()

      expect(mockedFetchRooms).toHaveBeenCalledWith({ name: undefined })
      expect(s.rows.value).toHaveLength(1)
      expect(s.rows.value[0]).toEqual(makeRoom())
    })
  })

  describe('search()', () => {
    it('sets name and calls fetchRooms with the given value', async () => {
      const s = useRooms()
      s.search('a')
      await flushPromises()

      expect(s.name.value).toBe('a')
      expect(mockedFetchRooms).toHaveBeenLastCalledWith({ name: 'a' })
    })

    it('sends name: undefined for an empty search string', async () => {
      const s = useRooms()
      s.search('')
      await flushPromises()

      expect(mockedFetchRooms).toHaveBeenLastCalledWith({ name: undefined })
    })
  })

  describe('modal state', () => {
    it('openCreate clears editing and opens the modal', () => {
      const s = useRooms()
      s.openEdit(makeRoom())
      s.openCreate()

      expect(s.editing.value).toBeNull()
      expect(s.modalOpen.value).toBe(true)
    })

    it('openEdit sets editing to the given room and opens the modal', () => {
      const s = useRooms()
      const room = makeRoom({ id: 9, name: 'Room 303' })
      s.openEdit(room)

      expect(s.editing.value).toEqual(room)
      expect(s.modalOpen.value).toBe(true)
    })
  })

  describe('submit()', () => {
    it('creates when not editing, then notifies, closes the modal and reloads', async () => {
      const s = useRooms()
      s.openCreate()
      mockedCreateRoom.mockResolvedValueOnce(makeRoom({ id: 99 }))

      await s.submit(form)
      await flushPromises()

      expect(mockedCreateRoom).toHaveBeenCalledWith(form)
      expect(mockedUpdateRoom).not.toHaveBeenCalled()
      expect(s.modalOpen.value).toBe(false)
      expect(mockedFetchRooms).toHaveBeenCalled()
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })

    it('updates the editing room by id', async () => {
      const s = useRooms()
      const editing = makeRoom({ id: 42 })
      s.openEdit(editing)
      mockedUpdateRoom.mockResolvedValueOnce(editing)

      await s.submit(form)
      await flushPromises()

      expect(mockedCreateRoom).not.toHaveBeenCalled()
      expect(mockedUpdateRoom).toHaveBeenCalledWith(42, form)
      expect(s.modalOpen.value).toBe(false)
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })
  })

  describe('remove()', () => {
    it('deletes the room by id, notifies and reloads', async () => {
      const s = useRooms()
      mockedDeleteRoom.mockResolvedValueOnce(undefined)
      const target = makeRoom({ id: 7 })

      await s.remove(target)
      await flushPromises()

      expect(mockedDeleteRoom).toHaveBeenCalledWith(7)
      expect(mockedFetchRooms).toHaveBeenCalled()
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })
  })
})
