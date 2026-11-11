<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { UiSelect } from '@/shared/components'
import { usePermissions } from '@/shared/composables/use-permissions'
import { usePayroll } from '../composables/use-payroll'
import PayrollMonthTabs from '../components/PayrollMonthTabs.vue'
import PayrollTable from '../components/PayrollTable.vue'
import PayStaffModal from '../components/PayStaffModal.vue'
import StaffExtraDialog from '@/shared/components/staff-extras/StaffExtraDialog.vue'
import { StaffExtraKind } from '@/shared/enums/staff-extra-kind.enum'
import type { StaffSalary } from '../interfaces/staff-salary.interface'
import StaffOverviewModal from '@/modules/staff/components/StaffOverviewModal.vue'

const { canPaySalary, canDeductSalary, canViewStaffPerformance } = usePermissions()
const p = usePayroll()
onMounted(p.init)
const extraRef = ref<InstanceType<typeof StaffExtraDialog> | null>(null)
/** A bonus defaults to the row's month; an advance to the current one. */
const openExtra = (kind: StaffExtraKind, row: StaffSalary) =>
  extraRef.value?.open(kind, { userId: row.userId, name: `${row.user.firstName} ${row.user.lastName}`, month: row.forMonth })

const yearOptions = computed(() => p.yearOptions.value.map((y) => ({ label: String(y), value: y })))
const toYear = (v: unknown) => (typeof v === 'number' ? p.setYear(v) : undefined)
</script>

<template>
  <div class="space-y-4">
    <div class="w-full max-w-[10rem]">
      <UiSelect
        :model-value="p.filters.year"
        :options="yearOptions"
        :searchable="false"
        :clearable="false"
        @update:model-value="toYear"
      />
    </div>

    <PayrollMonthTabs
      :model-value="p.filters.month"
      :months="p.monthOptions.value"
      :year="p.filters.year"
      @update:model-value="p.setMonth"
    />

    <PayrollTable
      :rows="p.rows.value"
      :loading="p.loading.value"
      :show-commission="p.showCommission.value"
      :can-pay="canPaySalary"
      :can-view-staff="canViewStaffPerformance"
      @pay="p.openPay"
      @open-staff="p.openStaff"
      @advance="openExtra(StaffExtraKind.ADVANCE, $event)"
      @bonus="openExtra(StaffExtraKind.BONUS, $event)"
    />

    <StaffExtraDialog ref="extraRef" @saved="p.load" />

    <PayStaffModal
      :model-value="p.pay.open"
      :staff="p.pay.staff"
      :loading="p.pay.loading"
      :can-deduct="canDeductSalary"
      :deduction-ready="p.deductionReady.value"
      v-model:amount="p.pay.amount"
      v-model:comment="p.pay.comment"
      v-model:with-deduction="p.pay.withDeduction"
      v-model:deduction-amount="p.pay.deductionAmount"
      v-model:deduction-reason="p.pay.deductionReason"
      v-model:deduction-type="p.pay.deductionType"
      @update:model-value="p.pay.open = $event"
      @confirm="p.confirmPay"
    />

    <StaffOverviewModal
      :open="p.staffModal.open"
      :user-id="p.staffModal.userId"
      :month="p.forMonth.value"
      @close="p.staffModal.open = false"
      @changed="p.load"
    />
  </div>
</template>
