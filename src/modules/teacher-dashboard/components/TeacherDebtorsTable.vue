<template>
  <section class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h3 class="text-sm font-semibold text-foreground">{{ t('teacherDashboard.debtors.title') }}</h3>
      <UiTabs :tabs="tabs" :model-value="filter" @update:model-value="emit('update:filter', $event as DebtorFilter)" />
    </div>
    <UiTable
      :columns="columns"
      :rows="debtors as unknown as Record<string, unknown>[]"
      row-key="key"
      :empty-text="t('teacherDashboard.debtors.empty')"
      :row-click="canOpen ? (row) => emit('open', row as unknown as TeacherDashboardDebtor) : undefined"
    >
      <template #cell-name="{ row }">{{ (row as TeacherDashboardDebtor).lastName }} {{ (row as TeacherDashboardDebtor).firstName }}</template>
      <template #cell-phone="{ row }"><span class="whitespace-nowrap font-mono">{{ formatPhone((row as TeacherDashboardDebtor).phone) || '—' }}</span></template>
      <template #cell-monthStatus="{ row }">
        <UiBadge v-if="(row as TeacherDashboardDebtor).monthStatus" :variant="PAYMENT_STATUS_VARIANTS[(row as TeacherDashboardDebtor).monthStatus!]">
          {{ t(PAYMENT_STATUS_LABEL_KEYS[(row as TeacherDashboardDebtor).monthStatus!]) }}
        </UiBadge>
        <span v-else class="text-muted-foreground">—</span>
      </template>
      <template #cell-monthDebt="{ row }"><span class="whitespace-nowrap font-mono">{{ formatSom((row as TeacherDashboardDebtor).monthDebt) }}</span></template>
      <template #cell-totalDebt="{ row }">
        <span class="whitespace-nowrap font-mono font-semibold text-danger">{{ formatSom((row as TeacherDashboardDebtor).totalDebt) }}</span>
        <span class="block text-xs text-muted-foreground">{{ t('teacherDashboard.debtors.months', { count: (row as TeacherDashboardDebtor).debtMonths }) }}</span>
      </template>
    </UiTable>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable, UiTabs, UiBadge } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import { formatPhone } from '@/shared/utils/format-phone'
import { PAYMENT_STATUS_LABEL_KEYS, PAYMENT_STATUS_VARIANTS } from '@/modules/payments/enums/payment-status.enum'
import { DebtorFilter, DEBTOR_FILTER_LABEL_KEYS } from '../enums/debtor-filter.enum'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import type { TabItem } from '@/shared/interfaces/tab-item.interface'
import type { TeacherDashboardDebtor } from '../interfaces/teacher-dashboard.interface'

const { t } = useI18n()
const props = defineProps<{ debtors: TeacherDashboardDebtor[]; filter: DebtorFilter; canOpen?: boolean }>()
const emit = defineEmits<{ 'update:filter': [value: DebtorFilter]; open: [debtor: TeacherDashboardDebtor] }>()

const tabs = computed<TabItem[]>(() =>
  Object.values(DebtorFilter).map((key) => ({ key, labelKey: DEBTOR_FILTER_LABEL_KEYS[key] })),
)
// A student in two of the teacher's groups is two rows — key on both ids.
const debtors = computed(() => props.debtors.map((d) => ({ ...d, key: `${d.studentId}-${d.groupId}` })))

const columns = computed<TableColumn[]>(() => [
  { key: 'name', label: t('teacherDashboard.debtors.student'), primary: true },
  { key: 'groupName', label: t('teacherDashboard.debtors.group') },
  { key: 'phone', label: t('teacherDashboard.debtors.phone') },
  { key: 'monthStatus', label: t('teacherDashboard.debtors.monthStatus') },
  { key: 'monthDebt', label: t('teacherDashboard.debtors.monthDebt'), align: 'right' },
  { key: 'totalDebt', label: t('teacherDashboard.debtors.totalDebt'), align: 'right' },
])
</script>
