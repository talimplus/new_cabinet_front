import { computed, reactive, ref } from 'vue'
import { fetchStudents, createStudent, updateStudent, changeStudentStatus } from '../api/students.api'
import { fetchSubjects } from '@/modules/subjects/api/subjects.api'
import { optionalRequest, emptyPage } from '@/shared/permissions/optional-request'
import { useScopeStore } from '@/stores/scope.store'
import { useNotificationStore } from '@/stores/notification.store'
import { StudentStatus } from '../enums/student-status.enum'
import { StudentStartMode } from '../enums/student-start-mode.enum'
import { useStudentStart, type StudentStartConfirm } from './use-student-start'
import type { StudentStatusChangeForm } from '../interfaces/student-start.interface'
import type { Student } from '../interfaces/student.interface'
import type { StudentForm } from '../interfaces/student-form.interface'
import type { StudentsParams } from '../interfaces/student-params.interface'
import type { ReturnLikelihood } from '../enums/return-likelihood.enum'
import type { StudentPreferredTime } from '../enums/student-preferred-time.enum'
import type { WeekDay } from '@/modules/groups/enums/week-day.enum'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { t } from '@/locales'

interface StudentFilters {
  search: string
  subjectId: number | null
  preferredTime: StudentPreferredTime | null
  preferredDays: WeekDay[]
  returnLikelihood: ReturnLikelihood | null
  page: number
  perPage: number
}

interface ReturnDialogState {
  open: boolean
  student: Student | null
  status: StudentStatus | null
}

/** List/state logic for one student page. `getStatus` is read live so the same
 *  view instance can be reused across student routes (Vue Router reuses it). */
export function useStudents(
  getStatus: () => StudentStatus,
  /** A 422 from saving the edit form after the start-date dialog — map it onto the form. */
  onEditError?: (error: unknown) => void,
) {
  const scope = useScopeStore()
  const notify = useNotificationStore()

  const rows = ref<Student[]>([])
  const totalPages = ref(1)
  const loading = ref(false)
  const subjectOptions = ref<SelectOption[]>([])
  const filters = reactive<StudentFilters>({
    search: '', subjectId: null, preferredTime: null,
    preferredDays: [], returnLikelihood: null, page: 1, perPage: 10,
  })

  const modalOpen = ref(false)
  const editing = ref<Student | null>(null)
  const saving = ref(false)
  const returnDialog = reactive<ReturnDialogState>({ open: false, student: null, status: null })

  async function load(): Promise<void> {
    loading.value = true
    try {
      const params: StudentsParams = {
        status: getStatus(),
        page: filters.page,
        perPage: filters.perPage,
        search: filters.search || undefined,
        subjectId: filters.subjectId ?? undefined,
        preferredTime: filters.preferredTime ?? undefined,
        preferredDays: filters.preferredDays.length ? filters.preferredDays : undefined,
        returnLikelihood: filters.returnLikelihood ?? undefined,
      }
      const { data, meta } = await fetchStudents(params)
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

  function resetFilters(): void {
    filters.search = ''
    filters.subjectId = null
    filters.preferredTime = null
    filters.preferredDays = []
    filters.returnLikelihood = null
    filters.page = 1
  }

  async function init(): Promise<void> {
    resetFilters()
    await Promise.all([load(), loadSubjects()])
  }

  function applyFilters(): void {
    filters.page = 1
    load()
  }
  function search(value: string): void {
    filters.search = value
    applyFilters()
  }
  function setPage(page: number): void {
    filters.page = page
    load()
  }

  function openCreate(): void {
    editing.value = null
    modalOpen.value = true
  }
  function openEdit(student: Student): void {
    editing.value = student
    modalOpen.value = true
  }

  /** The start-date dialog confirmed: activate from that day, or save the waiting edit. */
  async function onStartConfirm(p: StudentStartConfirm): Promise<boolean> {
    if (p.mode === StudentStartMode.ACTIVATE) {
      return applyStatus(p.student, StudentStatus.ACTIVE, { startDate: p.startDate })
    }
    try {
      await updateStudent(p.student.id, p.form!)
    } catch (error) {
      // Field errors (e.g. `groupJoinedAt`) belong under the edit form's inputs.
      start.close()
      onEditError?.(error)
      return false
    }
    notify.success(t('common.saved'))
    modalOpen.value = false
    await load()
    return true
  }
  const start = useStudentStart(onStartConfirm)

  /** Rethrows on failure so the view can map field errors onto the form. */
  async function submit(form: StudentForm): Promise<void> {
    if (editing.value && form.groupJoinedAt) {
      // Added groups with a past join date — re-bills from it; preview first.
      const { status: _omit, ...body } = form
      const before = editing.value.groupIds ?? []
      const added = (form.groupIds ?? []).filter((id) => !before.includes(id))
      start.openForJoin(editing.value, body, added)
      return
    }
    saving.value = true
    try {
      if (editing.value) {
        const { status: _omit, ...body } = form // status changes go through change-status
        await updateStudent(editing.value.id, body)
      } else {
        await createStudent(form)
      }
      notify.success(t('common.saved'))
      modalOpen.value = false
      await load()
    } finally {
      saving.value = false
    }
  }

  /** Resolves `false` on failure (the interceptor already toasted it). */
  async function applyStatus(student: Student, next: StudentStatus, extra?: StudentStatusChangeForm): Promise<boolean> {
    student.statusLoading = true
    try {
      await changeStudentStatus(student.id, next, extra)
      notify.success(t('leads.statusChanged'))
      await load()
      return true
    } catch {
      return false
    } finally {
      student.statusLoading = false
    }
  }

  /** Entry point for a status change from the table; may open the return dialog. */
  function requestStatus(student: Student, next: StudentStatus): void {
    if (next === StudentStatus.ACTIVE && !(student.groupIds && student.groupIds.length)) {
      notify.error(t('students.messages.groupRequired'))
      return
    }
    // First activation asks since when the student really studies (may be past).
    const first = student.status === StudentStatus.NEW || student.status === StudentStatus.IGNORED
    if (next === StudentStatus.ACTIVE && first) {
      start.openForActivate(student)
      return
    }
    if (next === StudentStatus.STOPPED || next === StudentStatus.IGNORED) {
      returnDialog.open = true
      returnDialog.student = student
      returnDialog.status = next
      return
    }
    applyStatus(student, next)
  }
  async function confirmReturn(payload: { returnLikelihood?: ReturnLikelihood; comment?: string }): Promise<void> {
    if (returnDialog.student && returnDialog.status) {
      // A failed change keeps the dialog open (the interceptor toasted why).
      if (!(await applyStatus(returnDialog.student, returnDialog.status, payload))) return
    }
    returnDialog.open = false
  }

  /** Rows on earlier pages — the table's № column continues from here. */
  const rowOffset = computed(() => (filters.page - 1) * filters.perPage)

  return {
    scope, rows, rowOffset, totalPages, loading, filters, subjectOptions,
    modalOpen, editing, saving, returnDialog,
    load, init, search, applyFilters, setPage,
    openCreate, openEdit, submit, requestStatus, confirmReturn, start,
  }
}
