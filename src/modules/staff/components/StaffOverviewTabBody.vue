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
  <StaffMonthsTable v-else :rows="data.months" />
</template>

<script setup lang="ts">
import { StaffTab } from '../enums/staff-tab.enum'
import StaffLateTable from './StaffLateTable.vue'
import StaffReceiptsTable from './StaffReceiptsTable.vue'
import StaffDeductionsTable from './StaffDeductionsTable.vue'
import StaffMonthsTable from './StaffMonthsTable.vue'
import type { StaffOverview, StaffDeductionRow } from '../interfaces/staff-overview.interface'

defineProps<{ data: StaffOverview; tab: string; canDeduct?: boolean; busy?: boolean }>()
const emit = defineEmits<{ remove: [row: StaffDeductionRow] }>()
</script>
