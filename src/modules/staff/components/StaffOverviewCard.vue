<template>
  <div v-if="s.loading.value && !s.data.value" class="p-10 text-center">
    <UiSpinner :size="24" class="mx-auto text-muted-foreground" />
  </div>

  <div v-else-if="s.data.value" class="space-y-4">
    <StaffOverviewHeader
      :user="s.data.value.user"
      :month="s.month.value"
      @update:month="s.setMonth"
    />

    <StaffOverviewStats :summary="s.data.value.summary" />

    <StaffGroupsCard v-if="s.data.value.user.role === UserRole.TEACHER" :groups="s.data.value.groups ?? []" />

    <StaffSalaryCard
      v-if="s.salary.value"
      :salary="s.salary.value"
      :outstanding="s.data.value.summary.deductionOutstanding"
      :advance-outstanding="s.data.value.summary.advanceOutstanding"
      :show-actions="showActions"
      :can-pay="canPaySalary"
      :can-deduct="canDeductSalary"
      @pay="s.openPay"
      @deduct="s.openDeduction"
    />
    <!-- No salary row for that month yet — a fine can still be written. -->
    <UiButton v-else-if="showActions && canDeductSalary" size="sm" variant="outline" @click="s.openDeduction">
      {{ t('staff.deduction.addButton') }}
    </UiButton>

    <UiTabs :tabs="s.tabs.value" v-model="s.tab.value" />

    <StaffOverviewTabBody
      :data="s.data.value"
      :tab="s.tab.value"
      :can-deduct="showActions && canDeductSalary"
      :can-manage-pay="showActions && canPaySalary"
      :busy="s.submitting.value || extras.busy.value"
      @remove="s.removeDeduction"
      @remove-advance="onRemoved(extras.removeAdvance($event))"
      @remove-bonus="onRemoved(extras.removeBonus($event))"
    />
  </div>

  <StaffOverviewDialogs :s="s" @pay="onPaid" @deduct="onDeducted" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiSpinner, UiTabs, UiButton } from '@/shared/components'
import { usePermissions } from '@/shared/composables/use-permissions'
import { UserRole } from '@/shared/enums/user-role.enum'
import { useStaffOverview } from '../composables/use-staff-overview'
import { useStaffPayExtras } from '../composables/use-staff-pay-extras'
import StaffOverviewHeader from './StaffOverviewHeader.vue'
import StaffOverviewStats from './StaffOverviewStats.vue'
import StaffGroupsCard from './StaffGroupsCard.vue'
import StaffSalaryCard from './StaffSalaryCard.vue'
import StaffOverviewTabBody from './StaffOverviewTabBody.vue'
import StaffOverviewDialogs from './StaffOverviewDialogs.vue'

const { t } = useI18n()
const { canPaySalary, canDeductSalary } = usePermissions()

const props = withDefaults(
  defineProps<{
    /** `null` = my own page (`/staff/me/overview`). */
    userId?: number | null
    month?: string
    /** Show the pay / fine buttons — off on a read-only page. */
    showActions?: boolean
    /** Keep month + tab in the URL — the page, not the payroll modal. */
    syncQuery?: boolean
  }>(),
  { userId: null, month: '', showActions: false, syncQuery: false },
)
const emit = defineEmits<{ changed: [] }>()

const s = useStaffOverview(() => props.userId, () => props.month, props.syncQuery)
onMounted(s.load)
const extras = useStaffPayExtras(s.load)

/** The payroll table behind the modal has to reflect the new numbers. */
async function onPaid(): Promise<void> {
  if (await s.submitPay()) emit('changed')
}
async function onDeducted(): Promise<void> {
  if (await s.submitDeduction()) emit('changed')
}
async function onRemoved(done: Promise<boolean>): Promise<void> {
  if (await done) emit('changed')
}
</script>
