import { reactive, ref } from 'vue'
import { dismissUser, reinstateUser } from '../api/users.api'
import { useNotificationStore } from '@/stores/notification.store'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import { toDateString } from '@/shared/utils/format-date'
import type { User } from '../interfaces/user.interface'
import { t } from '@/locales'

interface DismissState {
  target: User | null
  date: Date | null
  reason: string
  saving: boolean
  errors: Record<string, string>
}

/**
 * Dismissing an employee ("ishdan bo'shatish") and taking one back. Dismissal
 * blocks the login and moves the row to the archive; nothing is deleted.
 * `onDone` reloads the list.
 */
export function useUserDismiss(onDone: () => Promise<void> | void) {
  const notify = useNotificationStore()
  const state = reactive<DismissState>({ target: null, date: null, reason: '', saving: false, errors: {} })

  function open(user: User): void {
    Object.assign(state, { target: user, date: new Date(), reason: '', saving: false, errors: {} })
  }
  function close(): void {
    if (!state.saving) state.target = null
  }

  async function submit(): Promise<void> {
    const user = state.target
    if (!user || state.saving) return
    state.saving = true
    state.errors = {}
    try {
      await dismissUser(user.id, {
        dismissedAt: state.date ? toDateString(state.date) : undefined,
        reason: state.reason.trim() || undefined,
      })
      notify.success(t('users.dismiss.done', { name: `${user.firstName} ${user.lastName}` }))
      state.target = null
      await onDone()
    } catch (e) {
      // 422 → field errors under the inputs; a 400 (teacher still has groups) is toasted.
      state.errors = mapBackendErrors(e)
    } finally {
      state.saving = false
    }
  }

  const reinstateTarget = ref<User | null>(null)
  const reinstating = ref(false)
  async function confirmReinstate(): Promise<void> {
    const user = reinstateTarget.value
    if (!user || reinstating.value) return
    reinstating.value = true
    try {
      await reinstateUser(user.id)
      notify.success(t('users.reinstate.done'))
      reinstateTarget.value = null
      await onDone()
    } finally {
      reinstating.value = false
    }
  }

  return { state, open, close, submit, reinstateTarget, reinstating, confirmReinstate }
}
