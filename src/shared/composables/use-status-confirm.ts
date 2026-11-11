import { useConfirmStore } from '@/stores/confirm.store'
import { t } from '@/locales'

/**
 * "Name: «from» → «to». Confirm?" before any status change — a misclick on a
 * status select used to apply at once. Flows that already open their own
 * dialog (stop reason, start date…) don't ask twice. Labels come translated.
 */
export function useStatusConfirm() {
  const confirm = useConfirmStore()
  return (name: string, from: string, to: string): Promise<boolean> =>
    confirm.ask({
      title: t('common.statusConfirm.title'),
      message: t('common.statusConfirm.message', { name, from, to }),
    })
}
