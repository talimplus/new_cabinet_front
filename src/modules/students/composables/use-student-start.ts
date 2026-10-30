import { computed, reactive, ref } from 'vue'
import { previewStudentStartDate } from '../api/students.api'
import { StudentStartMode } from '../enums/student-start-mode.enum'
import { parseDate, toDateString } from '@/shared/utils/format-date'
import type { Student } from '../interfaces/student.interface'
import type { StudentForm } from '../interfaces/student-form.interface'
import type { StudentStartPreview } from '../interfaces/student-start.interface'

/** What the caller gets when the user confirms the dialog. */
export interface StudentStartConfirm {
  mode: StudentStartMode
  student: Student
  /** JOIN mode: the edit-form payload waiting for this confirmation. */
  form: StudentForm | null
  /** `YYYY-MM-DD` */
  startDate: string
}

interface StudentStartState {
  open: boolean
  mode: StudentStartMode
  student: Student | null
  form: StudentForm | null
  /** JOIN mode: the groups added in the edit. */
  groupIds: number[]
  date: Date | null
}

/**
 * "Since when does the student really study?" — first activation (any past
 * day) and the edit form adding a group with a past join date. A past date
 * creates/re-bills payments from that month, so the impact is previewed before
 * `onConfirm`. Today needs no preview: nothing moves backwards.
 */
export function useStudentStart(onConfirm: (payload: StudentStartConfirm) => Promise<boolean>) {
  const state = reactive<StudentStartState>({
    open: false, mode: StudentStartMode.ACTIVATE, student: null, form: null, groupIds: [], date: null,
  })
  const preview = ref<StudentStartPreview | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  let requestSeq = 0

  const today = (): string => toDateString(new Date())
  const isPast = computed(() => {
    const d = toDateString(state.date)
    return !!d && d < today()
  })

  async function load(): Promise<void> {
    const seq = ++requestSeq
    preview.value = null
    const startDate = toDateString(state.date)
    if (!state.student || !startDate || !isPast.value) {
      loading.value = false
      return
    }
    loading.value = true
    try {
      const groupIds = state.mode === StudentStartMode.JOIN ? state.groupIds : undefined
      const data = await previewStudentStartDate(state.student.id, { startDate, groupIds })
      if (seq === requestSeq) preview.value = data
    } catch {
      // The interceptor toasted it; Confirm stays off without a preview.
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  function openForActivate(student: Student): void {
    Object.assign(state, { open: true, mode: StudentStartMode.ACTIVATE, student, form: null, groupIds: [], date: new Date() })
    void load()
  }
  function openForJoin(student: Student, form: StudentForm, groupIds: number[]): void {
    Object.assign(state, { open: true, mode: StudentStartMode.JOIN, student, form, groupIds, date: parseDate(form.groupJoinedAt) })
    void load()
  }
  function setDate(date: Date | null): void {
    state.date = date
    void load()
  }

  /** A past date must be previewed first; today goes straight through. */
  const canConfirm = computed(() => !!state.date && !loading.value && (!isPast.value || !!preview.value))

  async function confirm(): Promise<void> {
    const startDate = toDateString(state.date)
    if (!state.student || !startDate || !canConfirm.value) return
    saving.value = true
    try {
      const ok = await onConfirm({ mode: state.mode, student: state.student, form: state.form, startDate })
      if (ok) state.open = false
    } finally {
      saving.value = false
    }
  }
  function close(): void {
    state.open = false
  }

  /** Everything `StudentStartDialog` renders, bundled for a one-line `v-bind`. */
  const dialogProps = computed(() => ({
    open: state.open,
    mode: state.mode,
    date: state.date,
    preview: preview.value,
    loading: loading.value,
    saving: saving.value,
    canConfirm: canConfirm.value,
  }))

  return { state, preview, loading, saving, isPast, canConfirm, dialogProps, openForActivate, openForJoin, setDate, confirm, close }
}
