import { computed, reactive, ref } from 'vue'
import { previewTransfer, transferStudents } from '@/shared/api/transfer.api'
import { optionalRequest } from '@/shared/permissions/optional-request'
import { useNotificationStore } from '@/stores/notification.store'
import { toDateString } from '@/shared/utils/format-date'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { TransferPreviewRow } from '@/shared/interfaces/student-transfer.interface'
import { t } from '@/locales'

interface TransferState {
  open: boolean
  fromGroupId: number | null
  fromGroupName: string
  toGroupId: number | null
  date: Date | null
  reason: string
  closeSourceGroup: boolean
  loading: boolean
  previewing: boolean
}

/** Minimal group shape the destination select needs. */
export interface TransferGroupOption {
  id: number
  name: string
}

/**
 * Moving one or more students out of one group into another. The month is split
 * between the two groups by lesson count, so the preview is shown first: what the
 * student still owes in the old group (stays there) and what they overpaid
 * (carried over).
 *
 * `loadGroups` is injected (not imported) so `shared/` never depends on a module:
 * callers pass their group loader, e.g. `() => fetchAllGroups()`.
 */
export function useStudentTransfer(
  studentIds: () => number[],
  onDone: () => Promise<void> | void,
  loadGroups: () => Promise<TransferGroupOption[]>,
) {
  const notify = useNotificationStore()

  const state = reactive<TransferState>({
    open: false,
    fromGroupId: null,
    fromGroupName: '',
    toGroupId: null,
    date: null,
    reason: '',
    closeSourceGroup: false,
    loading: false,
    previewing: false,
  })

  const rows = ref<TransferPreviewRow[]>([])
  const groupOptions = ref<SelectOption[]>([])

  const totalDebt = computed(() => rows.value.reduce((sum, r) => sum + (r.debt || 0), 0))
  const totalOverpaid = computed(() => rows.value.reduce((sum, r) => sum + (r.overpaid || 0), 0))
  /** The destination must differ from the source, or the backend 400s. */
  const valid = computed(() => !!state.toGroupId && state.toGroupId !== state.fromGroupId)

  async function open(fromGroupId: number, fromGroupName: string): Promise<void> {
    Object.assign(state, {
      open: true,
      fromGroupId,
      fromGroupName,
      toGroupId: null,
      date: null,
      reason: '',
      closeSourceGroup: false,
      previewing: true,
    })
    rows.value = []

    try {
      const [groups, preview] = await Promise.all([
        optionalRequest(loadGroups(), []),
        previewTransfer({ studentIds: studentIds(), fromGroupId }),
      ])
      // The source group itself is never a destination.
      groupOptions.value = groups
        .filter((g) => g.id !== fromGroupId)
        .map((g) => ({ label: g.name, value: g.id }))
      rows.value = preview
    } catch {
      /* toasted by the interceptor */
    } finally {
      state.previewing = false
    }
  }

  function close(): void {
    if (!state.loading) state.open = false
  }

  async function submit(): Promise<void> {
    if (!valid.value || state.fromGroupId == null || state.toGroupId == null) return
    state.loading = true
    try {
      const result = await transferStudents({
        studentIds: studentIds(),
        fromGroupId: state.fromGroupId,
        toGroupId: state.toGroupId,
        transferDate: state.date ? toDateString(state.date) : undefined,
        reason: state.reason.trim() || undefined,
        closeSourceGroup: state.closeSourceGroup || undefined,
      })
      notify.success(t('students.transfer.done', { count: result.transferred }))
      // The source group is auto-closed when its last students leave.
      if (result.sourceGroupClosed) notify.info(t('groups.messages.groupClosed'))
      state.open = false
      await onDone()
    } catch {
      /* toasted by the interceptor */
    } finally {
      state.loading = false
    }
  }

  return { state, rows, groupOptions, totalDebt, totalOverpaid, valid, open, close, submit }
}
