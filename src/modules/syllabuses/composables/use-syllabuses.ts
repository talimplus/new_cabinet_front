import { reactive, ref } from 'vue'
import { fetchSyllabuses, deleteSyllabus } from '../api/syllabuses.api'
import { fetchSubjects } from '@/modules/subjects/api/subjects.api'
import { optionalRequest, emptyPage } from '@/shared/permissions/optional-request'
import { useScopeStore } from '@/stores/scope.store'
import { useNotificationStore } from '@/stores/notification.store'
import type { SyllabusListItem } from '../interfaces/syllabus.interface'
import type { SyllabusesParams } from '../interfaces/syllabus-params.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { t } from '@/locales'

interface SyllabusFilters {
  subjectId: number | null
  name: string
  page: number
  perPage: number
}

/** List/state logic for the syllabuses ("Kurs rejalari") page. */
export function useSyllabuses() {
  const scope = useScopeStore()
  const notify = useNotificationStore()

  const rows = ref<SyllabusListItem[]>([])
  const totalPages = ref(1)
  const loading = ref(false)
  const subjectOptions = ref<SelectOption[]>([])
  const filters = reactive<SyllabusFilters>({ subjectId: null, name: '', page: 1, perPage: 10 })

  const modalOpen = ref(false)
  const aiModalOpen = ref(false)
  const deleteTarget = ref<SyllabusListItem | null>(null)
  const deleteLoading = ref(false)

  async function load(): Promise<void> {
    loading.value = true
    try {
      const params: SyllabusesParams = {
        subjectId: filters.subjectId ?? undefined,
        name: filters.name.trim() || undefined,
        page: filters.page,
        perPage: filters.perPage,
      }
      const { data, meta } = await fetchSyllabuses(params)
      rows.value = data
      totalPages.value = meta.totalPages ?? 1
    } finally {
      loading.value = false
    }
  }

  async function loadSubjects(): Promise<void> {
    const { data } = await optionalRequest(
      fetchSubjects({ page: 1, perPage: 100 }),
      emptyPage(),
    )
    subjectOptions.value = data.map((s) => ({ label: s.name, value: s.id }))
  }

  async function init(): Promise<void> {
    await Promise.all([load(), loadSubjects()])
  }


  function applyFilters(): void {
    filters.page = 1
    load()
  }
  function search(value: string): void {
    filters.name = value
    applyFilters()
  }
  function setPage(page: number): void {
    filters.page = page
    load()
  }

  function openCreate(): void {
    modalOpen.value = true
  }
  function openAi(): void {
    aiModalOpen.value = true
  }

  function requestDelete(item: SyllabusListItem): void {
    deleteTarget.value = item
  }
  async function confirmDelete(): Promise<void> {
    if (!deleteTarget.value) return
    deleteLoading.value = true
    try {
      await deleteSyllabus(deleteTarget.value.id)
      notify.success(t('common.deleted'))
      deleteTarget.value = null
      await load()
    } finally {
      deleteLoading.value = false
    }
  }

  return {
    scope, rows, totalPages, loading, filters, subjectOptions,
    modalOpen, aiModalOpen, deleteTarget, deleteLoading,
    init, load, applyFilters, search, setPage,
    openCreate, openAi, requestDelete, confirmDelete,
  }
}
