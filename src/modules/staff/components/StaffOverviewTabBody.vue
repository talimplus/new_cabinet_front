<template>
  <StaffLateTable v-if="tab === StaffTab.LATE" :rows="data.lateRecords" />
  <StaffReceiptsTable v-else-if="tab === StaffTab.RECEIPTS" :rows="data.unsettledReceipts" />
  <StaffDeductionsTable
    v-else-if="tab === StaffTab.DEDUCTIONS"
    :rows="data.deductions"
    :can-deduct="canDeduct"
    :busy="busy"
    @remove="emit('remove', $event)"
  />
  <StaffAdvancesTable
    v-else-if="tab === StaffTab.ADVANCES"
    :rows="data.advances ?? []"
    :can-manage="canManagePay"
    :busy="busy"
    @remove="emit('remove-advance', $event)"
  />
  <StaffBonusesTable
    v-else-if="tab === StaffTab.BONUSES"
    :rows="data.bonuses ?? []"
    :can-manage="canManagePay"
    :busy="busy"
    @remove="emit('remove-bonus', $event)"
  />
  <StaffMonthsTable v-else :rows="data.months" />
</template>

<script setup lang="ts">
import { StaffTab } from '../enums/staff-tab.enum'
import StaffLateTable from './StaffLateTable.vue'
import StaffReceiptsTable from './StaffReceiptsTable.vue'
import StaffDeductionsTable from './StaffDeductionsTable.vue'
import StaffAdvancesTable from './StaffAdvancesTable.vue'
import StaffBonusesTable from './StaffBonusesTable.vue'
import StaffMonthsTable from './StaffMonthsTable.vue'
import type { StaffOverview, StaffDeductionRow } from '../interfaces/staff-overview.interface'
import type { StaffBonusRow } from '../interfaces/staff-pay-extras.interface'

defineProps<{
  data: StaffOverview
  tab: string
  canDeduct?: boolean
  /** Delete advances / bonuses — `payroll.pay`, never on the employee's own page. */
  canManagePay?: boolean
  busy?: boolean
}>()
const emit = defineEmits<{
  remove: [row: StaffDeductionRow]
  'remove-advance': [row: StaffDeductionRow]
  'remove-bonus': [row: StaffBonusRow]
}>()
</script>
