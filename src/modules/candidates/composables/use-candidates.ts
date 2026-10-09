import { reactive, ref } from 'vue'
import { fetchCandidates, createCandidate, updateCandidate, deleteCandidate } from '../api/candidates.api'
import { fetchSubjects } from '@/modules/subjects/api/subjects.api'
import { optionalRequest, emptyPage } from '@/shared/permissions/optional-request'
import { useScopeStore } from '@/stores/scope.store'
import { useNotificationStore } from '@/stores/notification.store'
import type { Candidate } from '../interfaces/candidate.interface'
import type { CandidateForm } from '../interfaces/candidate-form.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { t } from '@/locales'

interface CandidateFilters {
  search: string
  subjectId: number | null
  page: number
  perPage: number
}

/** List/state logic for the job candidates (HR) page. */
export function useCandidates() {
  const scope = useScopeStore()
  const notify = useNotificationStore()

  const rows = ref<Candidate[]>([])
  const total = ref(0)
  const totalPages = ref(1)
  const loading = ref(false)
  const filters = reactive<CandidateFilters>({ search: '', subjectId: null, page: 1, perPage: 20 })
  const subjects = ref<SelectOption[]>([])

  const modalOpen = ref(false)
  const editing = ref<Candidate | null>(null)
  const deleteTarget = ref<Candidate | null>(null)
  const deleting = ref(false)

  async function load(): Promise<void> {
    loading.value = true
    try {
      const { data, meta } = await fetchCandidates({
        search: filters.search || undefined,
        subjectId: filters.subjectId ?? undefined,
        page: filters.page,
        perPage: filters.perPage,
      })
      rows.value = data
      total.value = meta.total ?? data.length
      totalPages.value = meta.totalPages || 1
    } finally {
      loading.value = false
    }
  }

  /** Subjects of the active center — options for the filter and the form.
   *  Optional data: without `subjects.view` the select is just empty. */
  async function loadSubjects(): Promise<void> {
    const res = await optionalRequest(fetchSubjects({ page: 1, perPage: 100 }), emptyPage())
    subjects.value = res.data.map((s) => ({ label: s.name, value: s.id }))
  }

  async function init(): Promise<void> {
    await Promise.all([load(), loadSubjects()])
  }

  function search(value: string): void {
    filters.search = value.trim()
    filters.page = 1
    load()
  }
  function setSubject(value: number | null): void {
    filters.subjectId = value
    filters.page = 1
    load()
  }
  function setPage(page: number): void {
    filters.page = page
    load()
  }

  function openCreate(): void {
    editing.value = null
    modalOpen.value = true
  }
  function openEdit(candidate: Candidate): void {
    editing.value = candidate
    modalOpen.value = true
  }

  async function submit(form: CandidateForm): Promise<void> {
    if (editing.value) await updateCandidate(editing.value.id, form)
    else await createCandidate(form)
    notify.success(t('common.saved'))
    modalOpen.value = false
    await load()
  }

  function requestDelete(candidate: Candidate): void {
    deleteTarget.value = candidate
  }
  function cancelDelete(): void {
    deleteTarget.value = null
  }
  async function confirmDelete(): Promise<void> {
    const target = deleteTarget.value
    if (!target || deleting.value) return
    deleting.value = true
    try {
      await deleteCandidate(target.id)
      notify.success(t('common.deleted'))
      deleteTarget.value = null
      // The last row of a page is gone — step back instead of showing an empty page.
      if (rows.value.length === 1 && filters.page > 1) filters.page -= 1
      await load()
    } finally {
      deleting.value = false
    }
  }

  return {
    scope, rows, total, totalPages, loading, filters, subjects, modalOpen, editing, deleteTarget, deleting,
    init, load, search, setSubject, setPage, openCreate, openEdit, submit, requestDelete, cancelDelete, confirmDelete,
  }
}
