import { computed, reactive } from 'vue'
import { carryStaffAdvance } from '@/shared/api/staff-extras.api'
import { useNotificationStore } from '@/stores/notification.store'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'

/** Who / which month the "move to next month" confirmation is about. */
export interface AdvanceCarryTarget {
  userId: number
  /** "YYYY-MM" or "YYYY-MM-01". */
  forMonth: string
  /** How much of the month's advance exceeds the salary. */
  over: number
}

interface CarryState {
  open: boolean
  target: AdvanceCarryTarget | null
  loading: boolean
}

const monthOf = (ym: string) => t(`common.months.${ym.slice(5, 7)}`)
const nextKey = (ym: string) => {
  const d = new Date(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)), 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * An advance above the month's salary is never moved on its own — the owner
 * presses "move to next month", confirms, and only the excess moves.
 */
export function useAdvanceCarry(onDone: () => Promise<void> | void) {
  const notify = useNotificationStore()
  const state = reactive<CarryState>({ open: false, target: null, loading: false })

  const message = computed(() => {
    const x = state.target
    if (!x) return ''
    return t('payroll.carry.confirm', {
      month: monthOf(x.forMonth),
      amount: formatSom(x.over),
      next: monthOf(nextKey(x.forMonth)),
    })
  })

  function ask(target: AdvanceCarryTarget): void {
    Object.assign(state, { open: true, target })
  }

  async function confirm(): Promise<void> {
    const x = state.target
    if (!x) return
    state.loading = true
    try {
      const r = await carryStaffAdvance({ userId: x.userId, forMonth: x.forMonth.slice(0, 7) })
      notify.success(t('payroll.carry.done', { amount: formatSom(r.moved), next: monthOf(r.toMonth) }))
      state.open = false
      await onDone()
    } finally {
      state.loading = false
    }
  }

  return { state, message, ask, confirm }
}
