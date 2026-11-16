import { computed, type Ref } from 'vue'
import { t } from '@/locales'
import { formatSom } from '@/shared/utils/format-money'
import { HealthLevel, SummaryTone } from '../enums/health-level.enum'
import type { StatsOverviewResponse } from '../interfaces/stats-overview.interface'
import type { SummaryLine } from '../interfaces/summary-line.interface'


const pct = (part: number, whole: number): number => (whole > 0 ? Math.round((part / whole) * 100) : 0)

/**
 * The page's plain-words digest for the owner: a few sentences and one verdict
 * ("all good" / "keep an eye" / "attention"), built only from the overview
 * figures — no new numbers, just said in words.
 */
export function useStatsSummary(data: Ref<StatsOverviewResponse | null>) {
  const collectedPct = computed(() => {
    const b = data.value?.billing
    return b ? pct(b.amountPaid + b.pendingAmount, b.amountDue) : 0
  })

  const level = computed<HealthLevel>(() => {
    const d = data.value
    if (!d) return HealthLevel.OK
    if (d.balance < 0 || (d.billing.amountDue > 0 && collectedPct.value < 50)) return HealthLevel.BAD
    if (collectedPct.value < 80 || d.students.stopped > d.students.started) return HealthLevel.OK
    return HealthLevel.GOOD
  })

  const lines = computed<SummaryLine[]>(() => {
    const d = data.value
    if (!d) return []
    const out = d.refunds.amount + d.expenses.amount + d.salaries.amount
    const list: SummaryLine[] = [
      { key: 'in', tone: SummaryTone.DEFAULT, text: t('statistics.summary.income', { amount: formatSom(d.income.amount), count: d.income.count }) },
      { key: 'out', tone: SummaryTone.DEFAULT, text: t('statistics.summary.spent', { amount: formatSom(out) }) },
      d.balance >= 0
        ? { key: 'net', tone: SummaryTone.SUCCESS, text: t('statistics.summary.left', { amount: formatSom(d.balance) }) }
        : { key: 'net', tone: SummaryTone.DANGER, text: t('statistics.summary.loss', { amount: formatSom(-d.balance) }) },
    ]
    if (d.pending.amount > 0) {
      list.push({ key: 'pending', tone: SummaryTone.WARNING, text: t('statistics.summary.pending', { amount: formatSom(d.pending.amount), count: d.pending.count }) })
    }
    if (d.billing.amountDue > 0) {
      list.push({
        key: 'collect',
        tone: collectedPct.value >= 80 ? SummaryTone.SUCCESS : collectedPct.value >= 50 ? SummaryTone.WARNING : SummaryTone.DANGER,
        text: d.billing.collectableAmount > 0
          ? t('statistics.summary.collect', { pct: collectedPct.value, amount: formatSom(d.billing.collectableAmount), count: d.billing.debtorsCount })
          : t('statistics.summary.collectedAll'),
      })
    }
    list.push({
      key: 'students',
      tone: d.students.stopped > d.students.started ? SummaryTone.WARNING : SummaryTone.DEFAULT,
      text: t('statistics.summary.students', { active: d.students.active, started: d.students.started, stopped: d.students.stopped }),
    })
    return list
  })

  return { level, lines, collectedPct }
}
