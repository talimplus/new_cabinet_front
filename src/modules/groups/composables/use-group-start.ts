import { computed, reactive, ref } from 'vue'
import { previewGroupStartDate } from '../api/groups.api'
import { GroupStartMode } from '../enums/group-start-mode.enum'
import { parseDate, toDateString } from '@/shared/utils/format-date'
import type { Group } from '../interfaces/group.interface'
import type { GroupForm } from '../interfaces/group-form.interface'
import type { GroupStartPreview } from '../interfaces/group-start.interface'

/** What the caller gets when the user confirms the dialog. */
export interface GroupStartConfirm {
  mode: GroupStartMode
  group: Group
  /** EDIT mode: the edit-form payload waiting for this confirmation. */
  form: GroupForm | null
  startDate: string
  backdateStudentIds: number[]
}

interface GroupStartState {
  open: boolean
  mode: GroupStartMode
  group: Group | null
  form: GroupForm | null
  date: Date | null
}

/**
 * The "when did lessons really start?" dialog. Money follows `startDate`, not
 * the status, so starting a group (or moving its start date on edit) shows the
 * payment impact first — new debts, refunds, months whose teacher salary is
 * already paid — and only then calls `onConfirm`.
 *
 * Members who joined after the new date are offered as candidates: on START
 * all are ticked (they were added before the group was in the system), on
 * EDIT none (a running group's members joined over time).
 */
export function useGroupStart(onConfirm: (payload: GroupStartConfirm) => Promise<boolean>) {
  const state = reactive<GroupStartState>({
    open: false, mode: GroupStartMode.START, group: null, form: null, date: null,
  })
  const preview = ref<GroupStartPreview | null>(null)
  const selected = ref<number[]>([])
  const loading = ref(false)
  const saving = ref(false)
  /** Only the latest preview request may write its answer (date picks race). */
  let requestSeq = 0

  async function load(ids?: number[]): Promise<void> {
    const startDate = toDateString(state.date)
    if (!state.group || !startDate) return
    const seq = ++requestSeq
    loading.value = true
    try {
      const data = await previewGroupStartDate(state.group.id, { startDate, backdateStudentIds: ids })
      if (seq !== requestSeq) return
      preview.value = data
      if (!ids) selected.value = data.candidates.map((c) => c.studentId)
    } catch {
      if (seq === requestSeq) preview.value = null
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  /** Lessons can't start ahead of today; a planned past/today date is kept. */
  function defaultDate(group: Group): Date {
    const today = new Date()
    const planned = parseDate(group.startDate)
    return planned && planned <= today ? planned : today
  }

  function show(mode: GroupStartMode, group: Group, form: GroupForm | null, date: Date | null): void {
    Object.assign(state, { open: true, mode, group, form, date })
    preview.value = null
    selected.value = []
  }

  function openForStart(group: Group): void {
    show(GroupStartMode.START, group, null, defaultDate(group))
    void load()
  }
  function openForEdit(group: Group, form: GroupForm): void {
    show(GroupStartMode.EDIT, group, form, parseDate(form.startDate))
    void load([])
  }

  function setDate(date: Date | null): void {
    state.date = date
    // A new date brings a new candidate list — START re-ticks all of them.
    void load(state.mode === GroupStartMode.START ? undefined : [])
  }
  function toggle(studentId: number, on: boolean): void {
    selected.value = on
      ? [...new Set([...selected.value, studentId])]
      : selected.value.filter((id) => id !== studentId)
    void load(selected.value)
  }

  /** Attendance before the new date — the backend refuses, so Confirm is off. */
  const blocked = computed(() => (preview.value?.attendanceBefore ?? 0) > 0)
  const canConfirm = computed(() => !!state.date && !!preview.value && !loading.value && !blocked.value)

  async function confirm(): Promise<void> {
    const startDate = toDateString(state.date)
    if (!state.group || !startDate || !canConfirm.value) return
    saving.value = true
    try {
      const ok = await onConfirm({
        mode: state.mode, group: state.group, form: state.form,
        startDate, backdateStudentIds: [...selected.value],
      })
      if (ok) state.open = false
    } finally {
      saving.value = false
    }
  }
  function close(): void {
    state.open = false
  }

  /** Everything `GroupStartDialog` renders, bundled for a one-line `v-bind`. */
  const dialogProps = computed(() => ({
    open: state.open,
    mode: state.mode,
    date: state.date,
    preview: preview.value,
    selected: selected.value,
    loading: loading.value,
    saving: saving.value,
    canConfirm: canConfirm.value,
  }))

  return { state, preview, selected, loading, saving, blocked, canConfirm, dialogProps, openForStart, openForEdit, setDate, toggle, confirm, close }
}
