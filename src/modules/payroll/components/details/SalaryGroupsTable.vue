<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[40rem] text-sm">
      <thead class="text-left text-xs text-muted-foreground">
        <tr>
          <th class="py-1.5 pr-3 font-medium">{{ t('payroll.details.commission.group') }}</th>
          <th v-for="c in COLS" :key="c" class="py-1.5 pr-3 text-right font-medium">
            {{ t(`payroll.details.commission.${c}`, { percent: f.percent }) }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="g in f.groups" :key="g.groupId" class="border-t border-border">
          <td class="py-2 pr-3">{{ g.groupName }}</td>
          <td class="py-2 pr-3 text-right font-mono">{{ g.students }}</td>
          <td class="py-2 pr-3 text-right font-mono">{{ formatMoney(g.due) }}</td>
          <td class="py-2 pr-3 text-right font-mono text-success">{{ formatMoney(g.paid) }}</td>
          <td class="py-2 pr-3 text-right font-mono text-info">{{ formatMoney(g.pending) }}</td>
          <td class="py-2 pr-3 text-right font-mono text-muted-foreground">{{ formatMoney(g.unpaid) }}</td>
          <td class="py-2 text-right font-mono font-semibold">{{ formatMoney(share(g.paid)) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="border-t border-border font-semibold">
          <td class="py-2 pr-3" colspan="2">{{ t('payroll.grid.totals') }}</td>
          <td class="py-2 pr-3 text-right font-mono">{{ formatMoney(f.totals.due) }}</td>
          <td class="py-2 pr-3 text-right font-mono text-success">{{ formatMoney(f.totals.paid) }}</td>
          <td class="py-2 pr-3 text-right font-mono text-info">{{ formatMoney(f.totals.pending) }}</td>
          <td class="py-2 pr-3 text-right font-mono text-muted-foreground">{{ formatMoney(f.totals.unpaid) }}</td>
          <td class="py-2 text-right font-mono">{{ formatMoney(f.shares.paid) }}</td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatMoney } from '@/shared/utils/format-money'
import type { SalaryForecast } from '@/shared/interfaces/salary-forecast.interface'

const { t } = useI18n()

/** Per group: owed, paid & confirmed, waiting, not paid — and the teacher's share of the paid part. */
const props = defineProps<{ f: SalaryForecast }>()
const COLS = ['students', 'due', 'paid', 'pending', 'unpaid', 'share']
const share = (v: number) => Math.round((v * props.f.percent) / 100)
</script>
