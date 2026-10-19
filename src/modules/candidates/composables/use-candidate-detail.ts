import { ref } from 'vue'
import { fetchCandidate, updateCandidate } from '../api/candidates.api'
import { fetchSubjects } from '@/modules/subjects/api/subjects.api'
import { optionalRequest, emptyPage } from '@/shared/permissions/optional-request'
import { useNotificationStore } from '@/stores/notification.store'
import type { Candidate } from '../interfaces/candidate.interface'
import type { CandidateForm } from '../interfaces/candidate-form.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { t } from '@/locales'

/** State for the candidate card page: the candidate, plus its edit modal. */
export function useCandidateDetail(id: () => number) {
  const notify = useNotificationStore()

  const candidate = ref<Candidate | null>(null)
  const loading = ref(false)
  /** 404 / foreign center — the page shows "not found" instead of an empty card. */
  const failed = ref(false)
  const subjects = ref<SelectOption[]>([])
  const modalOpen = ref(false)

  async function load(): Promise<void> {
    loading.value = true
    failed.value = false
    try {
      candidate.value = await fetchCandidate(id())
    } catch {
      candidate.value = null
      failed.value = true
    } finally {
      loading.value = false
    }
  }

  /** Options for the edit form; without `subjects.view` the select is just empty. */
  async function loadSubjects(): Promise<void> {
    const res = await optionalRequest(fetchSubjects({ page: 1, perPage: 100 }), emptyPage())
    subjects.value = res.data.map((s) => ({ label: s.name, value: s.id }))
  }

  async function init(): Promise<void> {
    await Promise.all([load(), loadSubjects()])
  }

  async function submit(form: CandidateForm): Promise<void> {
    if (!candidate.value) return
    candidate.value = await updateCandidate(candidate.value.id, form)
    notify.success(t('common.saved'))
    modalOpen.value = false
  }

  return { candidate, loading, failed, subjects, modalOpen, init, load, submit }
}
