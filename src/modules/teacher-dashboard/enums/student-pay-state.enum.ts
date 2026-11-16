/**
 * Where a student stands with the chosen month's payment. Derived on the
 * front from the month's row (`use-group-students.ts` → `payStateOf`), the
 * same rule the payments module uses for "waiting for confirmation".
 */
export enum StudentPayState {
  /** The month is fully paid and confirmed. */
  PAID = 'paid',
  /** The whole month was handed in, the admin has not confirmed it yet. */
  PENDING = 'pending',
  /** Part of the month is paid. */
  PARTIAL = 'partial',
  /** Nothing paid for the month. */
  UNPAID = 'unpaid',
  /** No charge for the month (joined later, left earlier, free month). */
  NONE = 'none',
}

export const STUDENT_PAY_STATE_LABEL_KEYS: Record<StudentPayState, string> = {
  [StudentPayState.PAID]: 'teacherDashboard.state.paid',
  [StudentPayState.PENDING]: 'teacherDashboard.state.pending',
  [StudentPayState.PARTIAL]: 'teacherDashboard.state.partial',
  [StudentPayState.UNPAID]: 'teacherDashboard.state.unpaid',
  [StudentPayState.NONE]: 'teacherDashboard.state.none',
}

export const STUDENT_PAY_STATE_VARIANTS: Record<StudentPayState, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  [StudentPayState.PAID]: 'success',
  [StudentPayState.PENDING]: 'info',
  [StudentPayState.PARTIAL]: 'warning',
  [StudentPayState.UNPAID]: 'danger',
  [StudentPayState.NONE]: 'neutral',
}
