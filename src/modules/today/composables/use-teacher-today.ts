import { ref, computed } from 'vue'
import { fetchTeacherToday } from '../api/today.api'
import { TeacherScope } from '../enums/teacher-scope.enum'
import type { TeacherToday } from '../interfaces/teacher-today.interface'

/** Loads `/today` and exposes the lessons sorted by start time + the scope flag. */
export function useTeacherToday() {
  const data = ref<TeacherToday | null>(null)
  const loading = ref(false)

  const isCenterScope = computed(() => data.value?.scope === TeacherScope.CENTER)
  const lessons = computed(() =>
    [...(data.value?.lessons ?? [])].sort((a, b) =>
      (a.startTime ?? '99:99').localeCompare(b.startTime ?? '99:99'),
    ),
  )

  async function load(): Promise<void> {
    loading.value = true
    try {
      data.value = await fetchTeacherToday()
    } finally {
      loading.value = false
    }
  }

  return { data, loading, isCenterScope, lessons, load }
}
