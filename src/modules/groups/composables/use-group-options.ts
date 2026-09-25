import { ref } from 'vue'
import { fetchSubjects } from '@/modules/subjects/api/subjects.api'
import { fetchRooms } from '@/modules/rooms/api/rooms.api'
import { fetchEmployees } from '@/modules/users/api/users.api'
import { optionalRequest, emptyPage } from '@/shared/permissions/optional-request'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

/** Loads the subject / room / teacher select options for a given center. */
export function useGroupOptions() {
  const subjects = ref<SelectOption[]>([])
  const rooms = ref<SelectOption[]>([])
  const teachers = ref<SelectOption[]>([])

  async function loadFor(centerId: number): Promise<void> {
    // Optional reference data — see `optionalRequest`.
    const [s, r, t] = await Promise.all([
      optionalRequest(fetchSubjects({ centerId, page: 1, perPage: 100 }), emptyPage()),
      optionalRequest(fetchRooms({ centerId }), emptyPage()),
      optionalRequest(fetchEmployees({ centerId, page: 1, perPage: 100 }), emptyPage()),
    ])
    subjects.value = s.data.map((x) => ({ label: x.name, value: x.id }))
    rooms.value = r.data.map((x) => ({ label: x.name, value: x.id }))
    teachers.value = t.data.map((x) => ({
      label: `${x.firstName ?? ''} ${x.lastName ?? ''}`.trim() || `#${x.id}`,
      value: x.id,
    }))
  }
  function clear(): void {
    subjects.value = []
    rooms.value = []
    teachers.value = []
  }

  return { subjects, rooms, teachers, loadFor, clear }
}
