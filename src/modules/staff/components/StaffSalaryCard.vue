<template>
  <div class="space-y-3 rounded-lg border border-border bg-surface p-4">
    <h3 class="text-base font-semibold text-foreground">
      {{ t('staff.salary.title', { month: formatMonth(salary.forMonth) }) }}
    </h3>

    <dl class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div v-for="field in fields" :key="field.label">
        <dt class="text-xs text-muted-foreground">{{ field.label }}</dt>
        <dd :class="cn('font-mono text-sm', field.tone)">{{ field.value }}</dd>
      </div>
    </dl>

    <!-- Which fine each withheld slice came from; an older month is flagged. -->
    <div v-if="salary.appliedDeductions.length" class="space-y-0.5 border-t border-border pt-2">
      <p class="text-xs text-muted-foreground">{{ t('staff.salary.appliedTitle') }}</p>
      <p v-for="applied in salary.appliedDeductions" :key="applied.id" class="text-xs text-foreground">
        − {{ formatSom(applied.amount) }} · {{ applied.reason }}
        <span v-if="applied.sourceForMonth && applied.sourceForMonth !== salary.forMonth" class="text-warning">
          ({{ t('staff.salary.fromMonth', { month: formatMonth(applied.sourceForMonth) }) }})
        </span>
      </p>
    </div>

    <p v-if="outstanding > 0" class="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
      {{ t('staff.salary.outstandingHint', { amount: formatSom(outstanding) }) }}
    </p>

    <div v-if="showActions" class="flex flex-wrap gap-2">
      <UiButton v-if="canPay && salary.remaining > 0" size="sm" @click="emit('pay')">
        {{ t('staff.salary.payButton') }}
      </UiButton>
      <UiButton v-if="canDeduct" size="sm" variant="outline" @click="emit('deduct')">
        {{ t('staff.deduction.addButton') }}
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/shared/components'
import { cn } from '@/shared/utils/cn'
import { formatSom } from '@/shared/utils/format-money'
import { formatMonth } from '@/shared/utils/format-month'
import type { StaffOverviewSalary } from '../interfaces/staff-overview.interface'

const { t } = useI18n()

const props = defineProps<{
  salary: StaffOverviewSalary
  outstanding: number
  showActions?: boolean
  canPay?: boolean
  canDeduct?: boolean
}>()
const emit = defineEmits<{ pay: []; deduct: [] }>()

const fields = computed(() => {
  const s = props.salary
  return [
    { label: t('staff.salary.base'), value: formatSom(s.baseSalary), tone: 'text-foreground' },
    {
      label: t('staff.salary.deduction'),
      value: `${s.deductionAmount > 0 ? '−' : ''}${formatSom(s.deductionAmount)}`,
      tone: s.deductionAmount > 0 ? 'text-danger' : 'text-foreground',
    },
    { label: t('staff.salary.net'), value: formatSom(s.netSalary), tone: 'font-semibold text-foreground' },
    {
      label: t('staff.salary.remaining'),
      value: formatSom(s.remaining),
      tone: s.remaining > 0 ? 'font-semibold text-danger' : 'text-foreground',
    },
  ]
})
</script>
