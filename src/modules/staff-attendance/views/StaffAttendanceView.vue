<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiIcon, UiTabs, UiPagination, UiConfirmDialog } from '@/shared/components'
import { Plus } from '@/shared/icons'
import { usePermissions } from '@/shared/composables/use-permissions'
import CheckInCard from '@/shared/components/attendance/CheckInCard.vue'
import StaffAttendanceFilters from '../components/StaffAttendanceFilters.vue'
import StaffAttendanceTable from '../components/StaffAttendanceTable.vue'
import StaffAttendanceReport from '../components/StaffAttendanceReport.vue'
import ManualAttendanceModal from '../components/ManualAttendanceModal.vue'
import { useStaffAttendance } from '../composables/use-staff-attendance'
import type { TabItem } from '@/shared/interfaces/tab-item.interface'

const { t } = useI18n()
const { isTeacher, canCheckIn, canManageStaffAttendance } = usePermissions()
const {
  tab, filters, rows, totalPages, loadingLog, report, loadingReport,
  centerNotConfigured, employees, pendingDelete, deleting, manual,
  init, reload, reloadLog, setPage, confirm, askDelete, confirmDelete, openManual, submitManual,
} = useStaffAttendance()
onMounted(init)

const tabs = computed<TabItem[]>(() => [
  { key: 'log', labelKey: 'staffAttendance.tabs.log' },
  { key: 'report', labelKey: 'staffAttendance.tabs.report' },
])
</script>

<template>
  <div class="space-y-4">
    <CheckInCard v-if="isTeacher && canCheckIn" />

    <div class="flex flex-wrap items-center gap-3">
      <h1 class="text-lg font-bold text-foreground">{{ t('staffAttendance.title') }}</h1>
      <UiButton v-if="canManageStaffAttendance" class="ml-auto" @click="openManual">
        <UiIcon :icon="Plus" :size="16" />{{ t('staffAttendance.manual.button') }}
      </UiButton>
    </div>

    <p v-if="centerNotConfigured" class="rounded-md bg-warning-soft px-3 py-2 text-sm text-warning">
      {{ t('staffAttendance.notConfigured') }}
    </p>

    <StaffAttendanceFilters
      :filters="filters"
      :employees="employees"
      :is-log="tab === 'log'"
      @reload="reload"
      @reload-log="reloadLog"
    />

    <UiTabs :tabs="tabs" :model-value="tab" @update:model-value="tab = $event as 'log' | 'report'" />

    <template v-if="tab === 'log'">
      <StaffAttendanceTable
        :rows="rows"
        :loading="loadingLog"
        :can-manage="canManageStaffAttendance"
        @confirm="confirm"
        @delete="askDelete"
      />
      <UiPagination :page="filters.page" :total-pages="totalPages" @update:page="setPage" />
    </template>
    <StaffAttendanceReport v-else :report="report" :loading="loadingReport" />

    <ManualAttendanceModal
      :state="manual"
      :employees="employees"
      @close="manual.open = false"
      @submit="submitManual"
    />

    <UiConfirmDialog
      :model-value="!!pendingDelete"
      :title="t('common.delete')"
      :message="t('common.confirmDelete')"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </div>
</template>
