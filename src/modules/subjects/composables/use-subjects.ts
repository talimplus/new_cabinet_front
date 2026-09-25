import { ref, reactive } from 'vue'
import { fetchSubjects, createSubject, updateSubject, deleteSubject } from '../api/subjects.api'
import { useScopeStore } from '@/stores/scope.store'
import { useNotificationStore } from '@/stores/notification.store'
import type { Subject } from '../interfaces/subject.interface'
import type { SubjectForm } from '../interfaces/subject-form.interface'
import { t } from '@/locales'

export function useSubjects() {
  const scope = useScopeStore()
  const notify = useNotificationStore()

  const rows = ref<Subject[]>([])
  const totalPages = ref(1)
  const loading = ref(false)
  const filters = reactive({ name: '', page: 1, perPage: 10 })

  const modalOpen = ref(false)
  const editing = ref<Subject | null>(null)

  async function load(): Promise<void> {
    loading.value = true
    try {
      const { data, meta } = await fetchSubjects({
        name: filters.name || undefined,
        page: filters.page,
        perPage: filters.perPage,
      })
      rows.value = data
      totalPages.value = meta.totalPages ?? 1
    } finally {
      loading.value = false
    }
  }

  async function init(): Promise<void> {
    await load()
  }

  function search(value: string): void {
    filters.name = value
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
  function openEdit(subject: Subject): void {
    editing.value = subject
    modalOpen.value = true
  }

  async function submit(form: SubjectForm): Promise<void> {
    if (editing.value) await updateSubject(editing.value.id, form)
    else await createSubject(form)
    notify.success(t('common.saved'))
    modalOpen.value = false
    await load()
  }
  async function remove(subject: Subject): Promise<void> {
    await deleteSubject(subject.id)
    notify.success(t('common.deleted'))
    await load()
  }

  return {
    scope, rows, totalPages, loading, filters, modalOpen, editing,
    init, search, setPage, openCreate, openEdit, submit, remove,
  }
}
