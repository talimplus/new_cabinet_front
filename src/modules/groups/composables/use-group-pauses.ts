import { reactive, ref } from 'vue'
import { fetchGroupPauses, createGroupPause, deleteGroupPause } from '../api/group-pauses.api'
import { useNotificationStore } from '@/stores/notification.store'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import { toDateString } from '@/shared/utils/format-date'
import { t } from '@/locales'
import type { GroupPause } from '../interfaces/group-pause.interface'

export interface PauseFormState {
  open: boolean
  fromDate: Date | null
  toDate: Date | null
  reason: string
  saving: boolean
  errors: Record<string, string>
}

/** Group detail → "paused periods" card: list, add (modal) and remove. */
export function useGroupPauses(groupId: number) {
  const notify = useNotificationStore()
  const pauses = ref<GroupPause[]>([])
  const loading = ref(false)
  const pendingDelete = ref<GroupPause | null>(null)
  const deleting = ref(false)
  const form = reactive<PauseFormState>({
    open: false, fromDate: null, toDate: null, reason: '', saving: false, errors: {},
  })

  async function load(): Promise<void> {
    loading.value = true
    try {
      pauses.value = await fetchGroupPauses(groupId)
    } finally {
      loading.value = false
    }
  }

  function openForm(): void {
    Object.assign(form, { open: true, fromDate: null, toDate: null, reason: '', errors: {} })
  }

  function setField(patch: Partial<Pick<PauseFormState, 'fromDate' | 'toDate' | 'reason'>>): void {
    Object.assign(form, patch)
  }
  function closeForm(): void {
    if (!form.saving) form.open = false
  }

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!form.fromDate) errors.fromDate = t('groups.pauses.validation.fromDate')
    if (!form.toDate) errors.toDate = t('groups.pauses.validation.toDate')
    else if (form.fromDate && form.toDate < form.fromDate) errors.toDate = t('groups.pauses.validation.range')
    if (!form.reason.trim()) errors.reason = t('groups.pauses.validation.reason')
    form.errors = errors
    return Object.keys(errors).length === 0
  }

  async function submit(): Promise<void> {
    if (!validate()) return
    form.saving = true
    try {
      await createGroupPause(groupId, {
        fromDate: toDateString(form.fromDate),
        toDate: toDateString(form.toDate),
        reason: form.reason.trim(),
      })
      notify.success(t('groups.pauses.messages.created'))
      form.open = false
      await load()
    } catch (e) {
      form.errors = mapBackendErrors(e)
    } finally {
      form.saving = false
    }
  }

  async function confirmDelete(): Promise<void> {
    if (!pendingDelete.value) return
    deleting.value = true
    try {
      await deleteGroupPause(groupId, pendingDelete.value.id)
      notify.success(t('groups.pauses.messages.deleted'))
      pendingDelete.value = null
      await load()
    } finally {
      deleting.value = false
    }
  }

  return {
    pauses, loading, form, pendingDelete, deleting,
    load, openForm, setField, closeForm, submit, confirmDelete,
  }
}
