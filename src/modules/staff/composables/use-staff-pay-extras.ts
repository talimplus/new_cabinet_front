import { ref } from 'vue'
import { deleteStaffAdvance, deleteStaffBonus } from '../api/staff-pay-extras.api'
import { useConfirmStore } from '@/stores/confirm.store'
import { useNotificationStore } from '@/stores/notification.store'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'
import type { StaffDeductionRow } from '../interfaces/staff-overview.interface'
import type { StaffBonusRow } from '../interfaces/staff-pay-extras.interface'

/**
 * Undo a mistaken advance or bonus from the staff card. Both ask first — the
 * salaries are recomputed server-side — then `reload` refreshes the card.
 * A bonus already paid out comes back 400 and is toasted by the interceptor.
 */
export function useStaffPayExtras(reload: () => Promise<void>) {
  const confirm = useConfirmStore()
  const notify = useNotificationStore()
  const busy = ref(false)

  async function run(title: string, message: string, request: () => Promise<unknown>, done: string) {
    if (!(await confirm.ask({ title, message, variant: 'danger', confirmLabel: t('common.delete') }))) return false
    busy.value = true
    try {
      await request()
      notify.success(done)
      await reload()
      return true
    } catch {
      return false
    } finally {
      busy.value = false
    }
  }

  const removeAdvance = (row: StaffDeductionRow) =>
    run(
      t('staff.advance.confirmTitle'),
      t('staff.advance.confirmDelete', { amount: formatSom(row.amount) }),
      () => deleteStaffAdvance(row.id),
      t('staff.advance.deleted'),
    )

  const removeBonus = (row: StaffBonusRow) =>
    run(
      t('staff.bonus.confirmTitle'),
      t('staff.bonus.confirmDelete', { amount: formatSom(row.amount) }),
      () => deleteStaffBonus(row.id),
      t('staff.bonus.deleted'),
    )

  return { busy, removeAdvance, removeBonus }
}
