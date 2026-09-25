import { ref, reactive } from 'vue'
import { fetchCenters, createCenter, updateCenter, deleteCenter } from '../api/centers.api'
import { useNotificationStore } from '@/stores/notification.store'
import { useScopeStore } from '@/stores/scope.store'
import type { Center } from '../interfaces/center.interface'
import type { CenterForm } from '../interfaces/center-form.interface'
import type { CentersParams } from '../interfaces/center-params.interface'
import { t } from '@/locales'

export function useCenters() {
  const notify = useNotificationStore()
  const scope = useScopeStore()

  const rows = ref<Center[]>([])
  const totalPages = ref(1)
  const loading = ref(false)
  const params = reactive<CentersParams>({ name: '', page: 1, perPage: 10 })

  const modalOpen = ref(false)
  const editing = ref<Center | null>(null)

  async function load(): Promise<void> {
    loading.value = true
    try {
      const { data, meta } = await fetchCenters({ ...params, name: params.name || undefined })
      rows.value = data
      totalPages.value = meta.totalPages ?? 1
    } finally {
      loading.value = false
    }
  }

  function search(name: string): void {
    params.name = name
    params.page = 1
    load()
  }
  function setPage(page: number): void {
    params.page = page
    load()
  }

  function openCreate(): void {
    editing.value = null
    modalOpen.value = true
  }
  function openEdit(center: Center): void {
    editing.value = center
    modalOpen.value = true
  }

  /** Create or update; throws on failure so the form can map field errors. */
  async function submit(form: CenterForm): Promise<void> {
    if (editing.value) await updateCenter(editing.value.id, form)
    else await createCenter(form)
    notify.success(t('common.saved'))
    modalOpen.value = false
    await load()
    // A rename / new default / new center must reach the header switcher too.
    await scope.loadCenters(true)
  }

  async function remove(center: Center): Promise<void> {
    await deleteCenter(center.id)
    notify.success(t('common.deleted'))
    await load()
    await scope.loadCenters(true)
  }

  return {
    rows, totalPages, loading, params, modalOpen, editing,
    load, search, setPage, openCreate, openEdit, submit, remove,
  }
}
