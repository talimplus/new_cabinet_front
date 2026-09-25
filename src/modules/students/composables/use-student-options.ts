import { ref } from 'vue'
import { fetchSubjects } from '@/modules/subjects/api/subjects.api'
import { fetchAllGroups } from '@/modules/groups/api/groups.api'
import { fetchAllStudents } from '../api/students.api'
import { optionalRequest, emptyPage } from '@/shared/permissions/optional-request'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

/** Loads the subject / group / referrer select options for the student form. */
export function useStudentOptions() {
  const subjects = ref<SelectOption[]>([])
  const groups = ref<SelectOption[]>([])
  const referrers = ref<SelectOption[]>([])

  async function loadFor(centerId: number): Promise<void> {
    // Optional reference data: a user may open this form without holding the
    // read key for every select behind it — then the select is simply empty.
    const [s, g, r] = await Promise.all([
      optionalRequest(fetchSubjects({ centerId, page: 1, perPage: 100 }), emptyPage()),
      optionalRequest(fetchAllGroups(centerId), []),
      optionalRequest(fetchAllStudents(centerId), []),
    ])
    subjects.value = s.data.map((x) => ({ label: x.name, value: x.id }))
    groups.value = g.map((x) => ({ label: x.name, value: x.id }))
    referrers.value = r.map((x) => ({
      label: `${x.firstName ?? ''} ${x.lastName ?? ''}`.trim() || `#${x.id}`,
      value: x.id,
    }))
  }
  function clear(): void {
    subjects.value = []
    groups.value = []
    referrers.value = []
  }

  return { subjects, groups, referrers, loadFor, clear }
}
