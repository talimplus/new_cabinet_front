import { computed, ref } from 'vue'
import { fetchStudentPaymentSummary } from '../api/student-card.api'
import { fetchStudentById, updateStudent } from '../api/students.api'
import { optionalRequest } from '@/shared/permissions/optional-request'
import { useNotificationStore } from '@/stores/notification.store'
import type { StudentPaymentSummary } from '../interfaces/student-summary.interface'
import type { Student, StudentDetail } from '../interfaces/student.interface'
import type { StudentForm } from '../interfaces/student-form.interface'
import { t } from '@/locales'

/**
 * The `/students/:id` card. Everything on screen comes from ONE request —
 * `GET /payments/student/{id}/summary` carries the profile (with `centerName`,
 * `subject` and each group's schedule), the totals and the months. The plain
 * student record is fetched lazily, only when the edit modal opens, because
 * that is the only thing that needs `groupIds` / passport fields.
 */
export function useStudentCard(studentId: () => number | null) {
  const notify = useNotificationStore()

  const summary = ref<StudentPaymentSummary | null>(null)
  const loading = ref(false)
  const failed = ref(false)

  const editOpen = ref(false)
  const editing = ref<Student | null>(null)
  const editLoading = ref(false)
  const saving = ref(false)

  const student = computed(() => summary.value?.student ?? null)
  const totals = computed(() => summary.value?.totals ?? null)
  const months = computed(() => summary.value?.months ?? [])
  const payableNow = computed(() => totals.value?.payableNow ?? 0)
  const hasPending = computed(() => (totals.value?.totalPending ?? 0) > 0)

  const fullName = computed(() =>
    student.value ? `${student.value.firstName} ${student.value.lastName}`.trim() : '',
  )
  const initials = computed(() => {
    const s = student.value
    if (!s) return ''
    return `${s.firstName?.[0] ?? ''}${s.lastName?.[0] ?? ''}`.toUpperCase()
  })

  async function load(): Promise<void> {
    const id = studentId()
    if (!id) return
    loading.value = true
    failed.value = false
    try {
      summary.value = await fetchStudentPaymentSummary(id)
    } catch {
      // Toasted by the interceptor; the view shows a "not found" panel.
      summary.value = null
      failed.value = true
    } finally {
      loading.value = false
    }
  }

  /** Applies a summary the server already returned (pay-debt) without a refetch. */
  function apply(next: StudentPaymentSummary | null): void {
    if (next?.student && next.totals) summary.value = next
    else load()
  }

  /** The edit modal wants `groupIds`; the detail endpoint returns objects. */
  function toEditable(detail: StudentDetail): Student {
    return { ...detail, groupIds: (detail.groups ?? []).map((g) => g.id) }
  }

  async function openEdit(): Promise<void> {
    const id = studentId()
    if (!id) return
    editLoading.value = true
    try {
      // Runs straight off a click, so a failure must not escape as an
      // unhandled rejection — the interceptor has already toasted it.
      const detail = await optionalRequest(fetchStudentById(id), null)
      if (detail) {
        editing.value = toEditable(detail)
        editOpen.value = true
      }
    } catch {
      /* already reported */
    } finally {
      editLoading.value = false
    }
  }

  async function saveEdit(form: StudentForm): Promise<void> {
    const id = studentId()
    if (!id) return
    saving.value = true
    try {
      await updateStudent(id, form)
      notify.success(t('common.saved'))
      editOpen.value = false
      editing.value = null
      await load()
    } finally {
      saving.value = false
    }
  }

  return {
    summary, loading, failed, student, totals, months, payableNow, hasPending,
    fullName, initials,
    editOpen, editing, editLoading, saving,
    load, apply, openEdit, saveEdit,
  }
}
