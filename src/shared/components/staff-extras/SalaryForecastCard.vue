<template>
  <section v-if="f" class="space-y-2 rounded-lg border border-border bg-surface p-4 text-sm">
    <h3 class="font-semibold text-foreground">{{ t('payroll.forecast.title', { month: monthLabel }) }}</h3>
    <div v-for="line in lines" :key="line.key" class="flex items-baseline justify-between gap-3">
      <span class="text-muted-foreground">{{ line.label }}</span>
      <span :class="cn('whitespace-nowrap font-mono', line.cls)">{{ line.value }}</span>
    </div>
    <div class="flex items-baseline justify-between gap-3 border-t border-border pt-2 font-semibold">
      <span>{{ t('payroll.forecast.estimate') }}</span>
      <span class="whitespace-nowrap font-mono">{{ formatSom(f.estimate) }}</span>
    </div>
    <div v-if="f.advanceGiven > 0" class="flex items-baseline justify-between gap-3">
      <span class="text-muted-foreground">{{ t('payroll.forecast.advanceGiven') }}</span>
      <span class="whitespace-nowrap font-mono text-warning">{{ formatSom(f.advanceGiven) }}</span>
    </div>
    <p v-if="f.advanceGiven > f.estimate" class="rounded-md bg-warning-soft px-2 py-1 text-xs text-warning">
      {{ t('payroll.forecast.advanceAboveEstimate', { amount: formatSom(f.advanceGiven - f.estimate) }) }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { cn } from '@/shared/utils/cn'
import { formatSom } from '@/shared/utils/format-money'
import { fetchSalaryForecast } from '@/shared/api/salary-forecast.api'
import { optionalRequest } from '@/shared/permissions/optional-request'
import type { SalaryForecast } from '@/shared/interfaces/salary-forecast.interface'

const { t } = useI18n()

/**
 * "Roughly how much will this person earn this month?" — what the owner looks
 * at before handing out an advance: paid & confirmed, waiting for confirmation,
 * not paid yet (the teacher's share of each), and the total if all is paid.
 * Hidden when the user may not read payroll.
 */
const props = defineProps<{ userId: number; /** "YYYY-MM". */ month: string }>()
const f = ref<SalaryForecast | null>(null)

watch(
  () => [props.userId, props.month],
  async () => {
    f.value = null
    if (!props.userId || !/^\d{4}-\d{2}$/.test(props.month)) return
    f.value = await optionalRequest(fetchSalaryForecast(props.userId, props.month), null).catch(() => null)
  },
  { immediate: true },
)

const monthLabel = computed(() => t(`common.months.${props.month.slice(5, 7)}`))
const lines = computed(() => {
  const x = f.value
  if (!x) return []
  const rows = [{ key: 'fixed', label: t('payroll.forecast.fixed'), value: formatSom(x.fixedSalary), cls: '' }]
  if (x.isTeacher) {
    rows.push({ key: 'paid', label: t('payroll.forecast.paid', { percent: x.percent }), value: formatSom(x.shares.paid), cls: 'text-success' })
  }
  rows.push({ key: 'calc', label: t('payroll.forecast.calculated'), value: formatSom(x.calculated), cls: 'font-semibold' })
  if (x.isTeacher) {
    rows.push(
      { key: 'pending', label: t('payroll.forecast.pending'), value: `+${formatSom(x.shares.pending)}`, cls: 'text-info' },
      { key: 'unpaid', label: t('payroll.forecast.unpaid'), value: `+${formatSom(x.shares.unpaid)}`, cls: 'text-muted-foreground' },
    )
  }
  return rows
})
</script>
