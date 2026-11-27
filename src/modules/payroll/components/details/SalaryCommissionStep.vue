<template>
  <SalaryStep :n="1" :title="t('payroll.details.steps.commission')">
    <div class="mb-3 flex justify-between gap-3 text-sm">
      <span class="text-muted-foreground">{{ t('payroll.details.commission.fixed') }}</span>
      <PayrollMoney :value="details.fixedSalary || 0" />
    </div>
    <p v-if="!details.commission" class="text-sm text-muted-foreground">{{ t('payroll.details.commission.notTeacher') }}</p>
    <p v-else-if="!details.commission.groups.length" class="text-sm text-muted-foreground">
      {{ t('payroll.details.commission.none') }}
    </p>
    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[28rem] text-sm">
        <thead class="text-left text-xs text-muted-foreground">
          <tr>
            <th class="py-1.5 pr-3 font-medium">{{ t('payroll.details.commission.group') }}</th>
            <th class="py-1.5 pr-3 text-right font-medium">{{ t('payroll.details.commission.paid') }}</th>
            <th class="py-1.5 pr-3 text-right font-medium">{{ t('payroll.details.commission.percent') }}</th>
            <th class="py-1.5 text-right font-medium">{{ t('payroll.details.commission.share') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in details.commission.groups" :key="g.groupId" class="border-t border-border">
            <td class="py-2 pr-3">{{ g.groupName }}</td>
            <td class="py-2 pr-3 text-right font-mono">{{ formatSom(g.paid) }}</td>
            <td class="py-2 pr-3 text-right font-mono">{{ details.commission.percent }}%</td>
            <td class="py-2 text-right font-mono">{{ formatSom(g.share) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t border-border font-semibold">
            <td colspan="3" class="py-2">{{ t('payroll.details.commission.total') }}</td>
            <td class="py-2 text-right font-mono">{{ formatSom(details.commission.total) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </SalaryStep>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatSom } from '@/shared/utils/format-money'
import SalaryStep from './SalaryStep.vue'
import PayrollMoney from '../PayrollMoney.vue'
import type { SalaryDetails } from '../../interfaces/salary-details.interface'

const { t } = useI18n()
defineProps<{ details: SalaryDetails }>()
</script>
