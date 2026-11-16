<template>
  <RouterLink
    :to="detailLink(StatsDetailKind.DEBTS, query)"
    class="group block rounded-lg border border-border bg-surface p-4 shadow-card transition-shadow hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:p-5"
  >
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div class="min-w-0">
        <h2 class="text-base font-bold text-foreground">{{ t('statistics.billing.title', { months: monthsLabel }) }}</h2>
        <p class="text-xs text-muted-foreground">{{ t('statistics.billing.subtitle') }}</p>
      </div>
      <span class="flex items-center gap-1 text-xs font-semibold text-primary">
        {{ t('statistics.billing.open') }}
        <UiIcon :icon="ChevronRight" :size="14" class="transition-transform group-hover:translate-x-0.5" />
      </span>
    </div>
    <dl class="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div v-for="f in figures" :key="f.key" class="min-w-0">
        <dt class="text-xs text-muted-foreground">{{ f.label }}</dt>
        <dd :class="cn('truncate font-mono text-lg font-semibold', f.cls)">{{ f.value }}</dd>
      </div>
    </dl>
    <UiStackedBar class="mt-4" :segments="segments" :title="t('statistics.billing.barTitle')" />
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { UiIcon, UiStackedBar } from '@/shared/components'
import { ChevronRight } from '@/shared/icons'
import { cn } from '@/shared/utils/cn'
import { formatSom } from '@/shared/utils/format-money'
import { StatsDetailKind } from '../enums/stats-detail-kind.enum'
import { detailLink } from '../composables/use-detail-link'
import type { StackedSegment } from '@/shared/interfaces/stacked-segment.interface'
import type { StatsOverviewResponse } from '../interfaces/stats-overview.interface'

const { t } = useI18n()
const props = defineProps<{ data: StatsOverviewResponse | null; query: Record<string, string> }>()

const monthName = (ym: string): string => `${t(`common.months.${ym.slice(5, 7)}`)} ${ym.slice(0, 4)}`
const monthsLabel = computed(() => {
  const d = props.data
  if (!d) return ''
  return d.billingFromMonth === d.billingToMonth ? monthName(d.billingFromMonth) : `${monthName(d.billingFromMonth)} – ${monthName(d.billingToMonth)}`
})

const figures = computed(() => {
  const b = props.data?.billing
  return [
    { key: 'due', label: t('statistics.billing.due'), value: formatSom(b?.amountDue ?? 0), cls: 'text-foreground' },
    { key: 'paid', label: t('statistics.billing.paid'), value: formatSom(b?.amountPaid ?? 0), cls: 'text-success' },
    { key: 'pending', label: t('statistics.billing.pending'), value: formatSom(b?.pendingAmount ?? 0), cls: 'text-warning' },
    { key: 'left', label: t('statistics.billing.left', { count: b?.debtorsCount ?? 0 }), value: formatSom(b?.collectableAmount ?? 0), cls: 'text-danger' },
  ]
})

/** Payment rows of those months by state — how many students are where. */
const segments = computed<StackedSegment[]>(() => {
  const b = props.data?.billing
  return [
    { key: 'paid', label: t('statistics.billing.paidCount'), value: b?.paidCount ?? 0, tone: 'success' },
    { key: 'pending', label: t('statistics.billing.pendingCount'), value: b?.pendingCount ?? 0, tone: 'info' },
    { key: 'partial', label: t('statistics.billing.partialCount'), value: b?.partialCount ?? 0, tone: 'warning' },
    { key: 'unpaid', label: t('statistics.billing.unpaidCount'), value: b?.unpaidCount ?? 0, tone: 'danger' },
  ]
})
</script>
