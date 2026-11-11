<template>
  <dl class="space-y-2 rounded-md bg-surface-muted px-3 py-2 text-sm">
    <div v-for="field in fields" :key="field.label" class="flex justify-between gap-2">
      <dt class="text-muted-foreground">{{ field.label }}</dt>
      <dd :class="cn('font-mono', field.tone)">{{ field.value }}</dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { cn } from '@/shared/utils/cn'
import { formatSom } from '@/shared/utils/format-money'
import { getTotalSalary, getRemaining, getFine, getAdvance } from '../utils/payroll-salary'
import type { StaffSalary } from '../interfaces/staff-salary.interface'

const { t } = useI18n()

const props = defineProps<{ staff: StaffSalary }>()

const extra = (label: string, amount: number, sign: string, tone: string) =>
  amount > 0 ? [{ label, value: `${sign}${formatSom(amount)}`, tone }] : []

const fields = computed(() => {
  const s = props.staff
  return [
    { label: t('payroll.modal.worker'), value: `${s.user.firstName} ${s.user.lastName}`, tone: '' },
    { label: t('payroll.modal.totalSalary'), value: formatSom(getTotalSalary(s)), tone: 'font-semibold' },
    // Only the extras that exist this month — they explain why "remaining" differs.
    ...extra(t('payroll.table.bonus'), s.bonusAmount ?? 0, '+', 'text-success'),
    ...extra(t('payroll.table.fine'), getFine(s), '−', 'text-danger'),
    ...extra(t('payroll.table.advance'), getAdvance(s), '−', 'text-warning'),
    { label: t('payroll.modal.paid'), value: formatSom(s.paidAmount), tone: '' },
    {
      label: t('payroll.modal.remainingAmount'),
      value: formatSom(getRemaining(s)),
      tone: 'font-semibold text-primary',
    },
  ]
})
</script>
