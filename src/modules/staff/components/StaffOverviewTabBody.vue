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
    @edit="edit(StaffExtraKind.ADVANCE, $event.id, $event.amount, $event.sourceForMonth ?? '', $event.reason)"
  />
  <StaffBonusesTable
    v-else-if="tab === StaffTab.BONUSES"
    :rows="data.bonuses ?? []"
    :can-manage="canManagePay"
    :busy="busy"
    @remove="emit('remove-bonus', $event)"
    @edit="edit(StaffExtraKind.BONUS, $event.id, $event.amount, $event.forMonth, $event.reason)"
  />
  <StaffMonthsTable v-else :rows="data.months" />
  <StaffExtraDialog ref="editRef" @saved="emit('extra-saved')" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StaffExtraDialog from '@/shared/components/staff-extras/StaffExtraDialog.vue'
import { StaffExtraKind } from '@/shared/enums/staff-extra-kind.enum'
import { StaffTab } from '../enums/staff-tab.enum'
import StaffLateTable from './StaffLateTable.vue'
import StaffReceiptsTable from './StaffReceiptsTable.vue'
import StaffDeductionsTable from './StaffDeductionsTable.vue'
import StaffAdvancesTable from './StaffAdvancesTable.vue'
import StaffBonusesTable from './StaffBonusesTable.vue'
import StaffMonthsTable from './StaffMonthsTable.vue'
import type { StaffOverview, StaffDeductionRow } from '../interfaces/staff-overview.interface'
import type { StaffBonusRow } from '../interfaces/staff-pay-extras.interface'

const props = defineProps<{
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
  /** An advance / bonus was corrected — the card reloads. */
  'extra-saved': []
}>()

const editRef = ref<InstanceType<typeof StaffExtraDialog> | null>(null)
/** Open the advance / bonus dialog pre-filled to correct a mistaken record. */
function edit(kind: StaffExtraKind, id: number, amount: number, forMonth: string, text: string | null): void {
  const { user } = props.data
  editRef.value?.open(kind, {
    userId: user.id,
    name: `${user.firstName} ${user.lastName}`,
    edit: { id, amount, forMonth, text: text ?? '' },
  })
}
</script>
