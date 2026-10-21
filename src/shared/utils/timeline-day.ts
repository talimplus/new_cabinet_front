import { t } from '@/locales'
import { formatDate, toDateString } from './format-date'

/** A timeline day header: "Today" / "Yesterday", otherwise dd.MM.yyyy. */
export function timelineDayLabel(key: string, now: Date): string {
  if (key === toDateString(now)) return t('common.timeline.today')
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (key === toDateString(yesterday)) return t('common.timeline.yesterday')
  return formatDate(key)
}
