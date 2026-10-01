import { computed, ref } from 'vue'
import { deleteStudent } from '../api/students.api'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useNotificationStore } from '@/stores/notification.store'
import { StudentStatus } from '../enums/student-status.enum'
import type { DeletableStudent } from '../interfaces/student-delete.interface'
import { t } from '@/locales'

/**
 * Confirm → `DELETE /students/:id` → `onDeleted`. Shared by the list row and
 * the student card. Only a NEW student can be deleted; whether it has payment
 * or attendance history the front cannot know, so that refusal arrives as a
 * backend 400 whose message the http interceptor toasts.
 */
export function useStudentDelete(onDeleted: () => unknown) {
  const notify = useNotificationStore()
  const { canDeleteStudent } = usePermissions()

  const target = ref<DeletableStudent | null>(null)
  const deleting = ref(false)

  const name = computed(() =>
    target.value ? `${target.value.firstName} ${target.value.lastName}`.trim() : '',
  )

  function canDelete(student: DeletableStudent | null | undefined): boolean {
    return canDeleteStudent.value && student?.status === StudentStatus.NEW
  }

  function request(student: DeletableStudent): void {
    if (canDelete(student)) target.value = student
  }

  function cancel(): void {
    if (!deleting.value) target.value = null
  }

  async function confirm(): Promise<void> {
    const student = target.value
    if (!student || deleting.value) return
    deleting.value = true
    try {
      await deleteStudent(student.id)
      notify.success(t('students.messages.deleted'))
      target.value = null
      await onDeleted()
    } catch {
      // The interceptor already toasted the backend message. Retrying cannot
      // succeed (wrong status / has history), so the dialog just closes.
      target.value = null
    } finally {
      deleting.value = false
    }
  }

  return { target, name, deleting, canDelete, request, cancel, confirm }
}
