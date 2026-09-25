import { reactive, ref } from 'vue'
import { fetchStudents, createStudent, updateStudent, changeStudentStatus } from '../api/students.api'
import { fetchSubjects } from '@/modules/subjects/api/subjects.api'
import { optionalRequest, emptyPage } from '@/shared/permissions/optional-request'
import { useScopeStore } from '@/stores/scope.store'
import { useNotificationStore } from '@/stores/notification.store'
import { StudentStatus } from '../enums/student-status.enum'
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
export function useStudents(getStatus: () => StudentStatus) {
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

  async function submit(form: StudentForm): Promise<void> {
    if (editing.value) {
      const { status: _omit, ...body } = form // status changes go through change-status
      await updateStudent(editing.value.id, body)
    } else {
      await createStudent(form)
    }
    notify.success(t('common.saved'))
    modalOpen.value = false
    await load()
  }

  async function applyStatus(student: Student, next: StudentStatus, extra?: { returnLikelihood?: ReturnLikelihood; comment?: string }): Promise<void> {
    student.statusLoading = true
    try {
      await changeStudentStatus(student.id, next, extra)
      notify.success(t('leads.statusChanged'))
      await load()
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
      await applyStatus(returnDialog.student, returnDialog.status, payload)
    }
    returnDialog.open = false
  }

  return {
    scope, rows, totalPages, loading, filters, subjectOptions,
    modalOpen, editing, returnDialog,
    init, search, applyFilters, setPage,
    openCreate, openEdit, submit, requestStatus, confirmReturn,
  }
}
