import { ref } from 'vue'
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '../api/rooms.api'
import { useScopeStore } from '@/stores/scope.store'
import { useNotificationStore } from '@/stores/notification.store'
import type { Room } from '../interfaces/room.interface'
import type { RoomForm } from '../interfaces/room-form.interface'
import { t } from '@/locales'

export function useRooms() {
  const scope = useScopeStore()
  const notify = useNotificationStore()

  const rows = ref<Room[]>([])
  const loading = ref(false)
  const name = ref('')
  const modalOpen = ref(false)
  const editing = ref<Room | null>(null)

  async function load(): Promise<void> {
    loading.value = true
    try {
      const { data } = await fetchRooms({ name: name.value || undefined })
      rows.value = data
    } finally {
      loading.value = false
    }
  }

  /** Load centers (pick default), then the rooms. Call on mount. */
  async function init(): Promise<void> {
    await load()
  }

  function search(value: string): void {
    name.value = value
    load()
  }

  function openCreate(): void {
    editing.value = null
    modalOpen.value = true
  }
  function openEdit(room: Room): void {
    editing.value = room
    modalOpen.value = true
  }

  async function submit(form: RoomForm): Promise<void> {
    if (editing.value) await updateRoom(editing.value.id, form)
    else await createRoom(form)
    notify.success(t('common.saved'))
    modalOpen.value = false
    await load()
  }
  async function remove(room: Room): Promise<void> {
    await deleteRoom(room.id)
    notify.success(t('common.deleted'))
    await load()
  }

  return {
    scope, rows, loading, name, modalOpen, editing,
    init, search, openCreate, openEdit, submit, remove,
  }
}
