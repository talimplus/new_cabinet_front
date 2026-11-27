<template>
  <SalaryStep :n="5" :title="t('payroll.details.steps.payments')">
    <p v-if="!details.payments.length" class="text-sm text-muted-foreground">{{ t('payroll.details.payments.none') }}</p>
    <ul v-else class="divide-y divide-border text-sm">
      <li v-for="p in details.payments" :key="p.id" class="flex flex-wrap justify-between gap-2 py-2">
        <div class="min-w-0">
          <div class="font-mono">{{ formatDateTime(p.paidAt) }}</div>
          <div class="text-xs text-muted-foreground">
            {{ [p.paidBy ? t('payroll.details.payments.by', { name: p.paidBy }) : '', p.comment ?? ''].filter(Boolean).join(' · ') }}
          </div>
        </div>
        <PayrollMoney :value="p.amount" />
      </li>
    </ul>
  </SalaryStep>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatDateTime } from '@/shared/utils/format-date'
import SalaryStep from './SalaryStep.vue'
import PayrollMoney from '../PayrollMoney.vue'
import type { SalaryDetails } from '../../interfaces/salary-details.interface'

const { t } = useI18n()
defineProps<{ details: SalaryDetails }>()
</script>
