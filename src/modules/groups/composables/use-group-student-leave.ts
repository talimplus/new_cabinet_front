import { reactive } from 'vue'
import { fetchStudentById, leaveStudentGroup } from '@/modules/students/api/students.api'
import { useNotificationStore } from '@/stores/notification.store'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import { toDateString } from '@/shared/utils/format-date'
import { formatSom } from '@/shared/utils/format-money'
import { GroupStatus } from '../enums/group-status.enum'
import type { ReturnLikelihood } from '@/modules/students/enums/return-likelihood.enum'
import type { Student } from '@/modules/students/interfaces/student.interface'
import { t } from '@/locales'

/**
 * "Guruhdan chiqarish": the student stops studying in THIS group only, billed up
 * to the chosen day. Their last unfinished group also stops the student, which
 * needs a return likelihood — the dialog asks for it only in that case.
 */
export function useGroupStudentLeave(groupId: number, onDone: () => void) {
  const notify = useNotificationStore()
  const state = reactive({
    open: false,
    student: null as Student | null,
    stopDate: new Date() as Date | null,
    reason: '',
    likelihood: null as ReturnLikelihood | null,
    isLastGroup: false,
    checking: false,
    saving: false,
    errors: {} as Record<string, string>,
  })

  async function open(student: Student): Promise<void> {
    Object.assign(state, {
      open: true, student, stopDate: new Date(), reason: '', likelihood: null,
      isLastGroup: false, checking: true, errors: {},
    })
    try {
      // The list row has bare `groupIds`; finished groups don't count as studying.
      const { groups = [] } = await fetchStudentById(student.id)
      state.isLastGroup = !groups.some((g) => g.id !== groupId && g.status !== GroupStatus.FINISHED)
    } catch {
      // The backend still enforces it: a 422 `returnLikelihood` reveals the select.
    } finally {
      state.checking = false
    }
  }

  function doneMessage(name: string, refunded: number, debt: number): string {
    return [
      t('groups.leave.done', { name }),
      refunded > 0 ? t('groups.leave.doneRefund', { amount: formatSom(refunded) }) : '',
      debt > 0 ? t('groups.leave.doneDebt', { amount: formatSom(debt) }) : '',
    ].filter(Boolean).join(' ')
  }

  async function submit(): Promise<void> {
    const student = state.student
    if (!student || !state.stopDate) return
    state.saving = true
    state.errors = {}
    try {
      const date = toDateString(state.stopDate)
      const res = await leaveStudentGroup(student.id, {
        groupId,
        // Today is the backend default (in the group's timezone).
        stopDate: date !== toDateString(new Date()) ? date : undefined,
        returnLikelihood: state.likelihood ?? undefined,
        reason: state.reason.trim() || undefined,
      })
      notify.success(doneMessage(`${student.lastName} ${student.firstName}`, res.refundedAmount, res.remainingDebt))
      state.open = false
      onDone()
    } catch (e) {
      state.errors = mapBackendErrors(e)
      if (state.errors.returnLikelihood) state.isLastGroup = true
    } finally {
      state.saving = false
    }
  }

  return { state, open, submit }
}
