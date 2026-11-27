<template>
  <SalaryStep :n="4" :title="t('payroll.details.steps.advances')">
    <p v-if="!details.advances.length" class="text-sm text-muted-foreground">{{ t('payroll.details.advances.none') }}</p>
    <template v-else>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[36rem] text-sm">
          <thead class="text-left text-xs text-muted-foreground">
            <tr>
              <th v-for="h in HEADERS" :key="h" :class="cn('py-1.5 pr-3 font-medium', h !== 'comment' && h !== 'date' && h !== 'month' && 'text-right')">
                {{ t(`payroll.details.advances.${h}`) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in details.advances" :key="a.id" class="border-t border-border align-top">
              <td class="py-2 pr-3 font-mono">{{ formatDate(a.createdAt) }}</td>
              <td class="py-2 pr-3 text-right font-mono">{{ formatSom(a.amount) }}</td>
              <td class="py-2 pr-3">{{ a.forMonth ? monthName(a.forMonth) : '—' }}</td>
              <td class="py-2 pr-3">{{ a.reason }}</td>
              <td class="py-2 pr-3 text-right"><PayrollMoney :value="a.thisMonth" tone="minus" /></td>
              <td class="py-2 text-right font-mono">{{ formatSom(advanceLeftAfter(a, details.forMonth)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Where the rest of each advance went — the owner's main question. -->
      <ul class="mt-3 space-y-1 text-xs text-muted-foreground">
        <template v-for="a in details.advances" :key="`s${a.id}`">
          <li v-for="(line, i) in advanceStory(a, details.forMonth)" :key="i">
            {{ formatSom(a.amount) }} ({{ formatDate(a.createdAt) }}): {{ line }}
          </li>
        </template>
      </ul>
    </template>
  </SalaryStep>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { cn } from '@/shared/utils/cn'
import { formatDate } from '@/shared/utils/format-date'
import { formatSom } from '@/shared/utils/format-money'
import SalaryStep from './SalaryStep.vue'
import PayrollMoney from '../PayrollMoney.vue'
import { monthName } from '../../utils/payroll-salary'
import { advanceLeftAfter, advanceStory } from '../../utils/salary-details-text'
import type { SalaryDetails } from '../../interfaces/salary-details.interface'

const { t } = useI18n()
defineProps<{ details: SalaryDetails }>()

const HEADERS = ['date', 'amount', 'month', 'comment', 'thisMonth', 'left']
</script>
