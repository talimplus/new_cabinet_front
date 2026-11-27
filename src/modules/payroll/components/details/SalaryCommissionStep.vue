<template>
  <SalaryStep :n="1" :title="t('payroll.details.steps.commission')">
    <div class="space-y-2 text-sm">
      <div class="flex justify-between gap-3">
        <span class="text-muted-foreground">{{ t('payroll.details.commission.fixed') }}</span>
        <PayrollMoney :value="f.fixedSalary || 0" />
      </div>
      <p v-if="!f.isTeacher" class="text-muted-foreground">{{ t('payroll.details.commission.notTeacher') }}</p>
      <p v-else-if="!f.groups.length" class="text-muted-foreground">{{ t('payroll.details.commission.none') }}</p>
      <template v-else>
        <SalaryGroupsTable :f="f" />
        <div class="flex justify-between gap-3">
          <span class="text-muted-foreground">{{ t('payroll.details.commission.total') }}</span>
          <PayrollMoney :value="f.shares.paid" />
        </div>
      </template>
      <div class="flex justify-between gap-3 border-t border-border pt-2 font-semibold">
        <span>{{ t('payroll.forecast.calculated') }}</span>
        <PayrollMoney :value="f.calculated" />
      </div>
      <div v-if="f.isTeacher && f.estimate !== f.calculated" class="flex justify-between gap-3 text-info">
        <span>{{ t('payroll.details.commission.estimate') }}</span>
        <span class="whitespace-nowrap font-mono">{{ formatSom(f.estimate) }}</span>
      </div>
    </div>
  </SalaryStep>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatSom } from '@/shared/utils/format-money'
import SalaryStep from './SalaryStep.vue'
import SalaryGroupsTable from './SalaryGroupsTable.vue'
import PayrollMoney from '../PayrollMoney.vue'
import type { SalaryDetails } from '../../interfaces/salary-details.interface'

const { t } = useI18n()
const props = defineProps<{ details: SalaryDetails }>()
const f = computed(() => props.details.forecast)
</script>
