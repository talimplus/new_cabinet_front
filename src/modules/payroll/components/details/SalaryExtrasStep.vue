<template>
  <SalaryStep :n="3" :title="t('payroll.details.steps.extras')">
    <p v-if="!details.bonuses.length && !details.fines.length" class="text-sm text-muted-foreground">
      {{ t('payroll.details.extras.none') }}
    </p>
    <ul v-else class="divide-y divide-border text-sm">
      <li v-for="b in details.bonuses" :key="`b${b.id}`" class="flex flex-wrap justify-between gap-2 py-2">
        <div class="min-w-0">
          <div class="font-medium">{{ t('payroll.details.extras.bonus') }} — {{ b.reason }}</div>
          <div class="text-xs text-muted-foreground">{{ meta(b.createdAt, b.createdBy) }}</div>
        </div>
        <PayrollMoney :value="b.amount" tone="plus" />
      </li>
      <li v-for="f in details.fines" :key="`f${f.id}`" class="flex flex-wrap justify-between gap-2 py-2">
        <div class="min-w-0">
          <div class="font-medium">{{ t('payroll.details.extras.fine') }} — {{ f.reason }}</div>
          <div class="text-xs text-muted-foreground">{{ meta(f.createdAt, f.createdBy) }}</div>
          <div v-if="f.thisMonth !== f.amount" class="text-xs text-muted-foreground">
            {{ t('payroll.details.extras.fineElsewhere', { amount: formatSom(f.amount), part: formatSom(f.thisMonth) }) }}
          </div>
        </div>
        <PayrollMoney :value="f.thisMonth" tone="minus" />
      </li>
    </ul>
  </SalaryStep>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatDate } from '@/shared/utils/format-date'
import { formatSom } from '@/shared/utils/format-money'
import SalaryStep from './SalaryStep.vue'
import PayrollMoney from '../PayrollMoney.vue'
import type { SalaryDetails } from '../../interfaces/salary-details.interface'

const { t } = useI18n()
defineProps<{ details: SalaryDetails }>()

/** "28.11.2026 · Ali Valiyev kiritgan". */
const meta = (date: string | null, by: string | null) =>
  [formatDate(date), by ? t('payroll.details.extras.by', { name: by }) : ''].filter(Boolean).join(' · ')
</script>
