<template>
  <!-- Not computed yet: one compact line, never a tall empty card. -->
  <section
    v-if="!salary.row"
    class="flex flex-wrap items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-card"
  >
    <span class="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-surface-muted text-muted-foreground">
      <UiIcon :icon="Wallet" :size="18" />
    </span>
    <div class="min-w-0 flex-1 space-y-0.5">
      <h3 class="text-sm font-semibold text-foreground">{{ t('teacherDashboard.salary.title') }}</h3>
      <p class="text-sm text-muted-foreground">{{ t('teacherDashboard.salary.empty') }}</p>
      <p v-if="salary.advanceOutstanding > 0" class="text-xs text-info">
        {{ t('teacherDashboard.salary.outstanding', { amount: formatSom(salary.advanceOutstanding) }) }}
      </p>
    </div>
    <TeacherSalaryEntries class="w-full" :bonuses="salary.bonuses" :advances="salary.advances" />
  </section>

  <section v-else class="space-y-4 rounded-lg border border-border bg-surface p-4 shadow-card">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="text-sm font-semibold text-foreground">{{ t('teacherDashboard.salary.title') }}</h3>
        <p class="text-xs text-muted-foreground">{{ t('teacherDashboard.salary.hint') }}</p>
      </div>
      <UiBadge :variant="SALARY_STATUS_VARIANTS[salary.row.status]">
        {{ t(SALARY_STATUS_LABEL_KEYS[salary.row.status]) }}
      </UiBadge>
    </div>

    <div class="grid gap-x-6 gap-y-4 lg:grid-cols-2">
      <div class="min-w-0 space-y-3">
        <!-- Hero figure: what is handed over this month in total. -->
        <div>
          <p class="text-xs text-muted-foreground">{{ t('teacherDashboard.salary.net') }}</p>
          <p class="font-mono text-2xl font-bold text-foreground">{{ formatSom(salary.row.netSalary) }}</p>
        </div>
        <TeacherSalaryWaterfall :row="salary.row" />
      </div>
      <div class="min-w-0 space-y-3">
        <div v-if="salary.row.netSalary > 0" class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">{{ t('teacherDashboard.salary.payout') }}</p>
          <UiStackedBar :segments="payout" :title="t('teacherDashboard.salary.net')" />
        </div>
        <TeacherSalaryEntries :bonuses="salary.bonuses" :advances="salary.advances" />
        <p v-if="salary.advanceOutstanding > 0" class="rounded-md bg-info-soft px-3 py-2 text-xs text-info">
          {{ t('teacherDashboard.salary.outstanding', { amount: formatSom(salary.advanceOutstanding) }) }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiBadge, UiIcon, UiStackedBar } from '@/shared/components'
import { Wallet } from '@/shared/icons'
import { formatSom } from '@/shared/utils/format-money'
import { SALARY_STATUS_LABEL_KEYS, SALARY_STATUS_VARIANTS } from '../enums/salary-status.enum'
import TeacherSalaryWaterfall from './TeacherSalaryWaterfall.vue'
import TeacherSalaryEntries from './TeacherSalaryEntries.vue'
import type { StackedSegment } from '@/shared/interfaces/stacked-segment.interface'
import type { TeacherDashboardSalary } from '../interfaces/teacher-dashboard.interface'

const { t } = useI18n()
const props = defineProps<{ salary: TeacherDashboardSalary }>()

/** Of what is handed over this month: paid already vs still to be paid. */
const payout = computed<StackedSegment[]>(() => {
  const r = props.salary.row
  if (!r) return []
  return [
    { key: 'paid', label: t('teacherDashboard.salary.paid'), value: r.paidAmount, tone: 'success', display: formatSom(r.paidAmount) },
    { key: 'remaining', label: t('teacherDashboard.salary.remaining'), value: r.remaining, tone: 'warning', display: formatSom(r.remaining) },
  ]
})
</script>
