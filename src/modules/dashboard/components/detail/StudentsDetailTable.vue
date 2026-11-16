<template>
  <UiTable :columns="columns" :rows="rows" :loading="loading" :empty-text="t('statistics.detail.empty')" :row-click="rowClick">
    <template #cell-fullName="{ row }">
      <span class="font-medium">{{ r(row).fullName }}</span>
      <span class="block text-xs text-muted-foreground">{{ r(row).groups ?? t('statistics.detail.noGroup') }}</span>
    </template>
    <template #cell-phone="{ row }"><span class="font-mono whitespace-nowrap">{{ formatPhone(r(row).phone) || '—' }}</span></template>
    <template #cell-status="{ row }">
      <UiBadge :variant="STUDENT_STATUS_VARIANTS[r(row).status] ?? 'neutral'">{{ t(STUDENT_STATUS_LABEL_KEYS[r(row).status] ?? '') }}</UiBadge>
    </template>
    <template #cell-date="{ row }"><span class="font-mono whitespace-nowrap">{{ formatDate(r(row).date) }}</span></template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiBadge, UiTable } from '@/shared/components'
import { formatDate } from '@/shared/utils/format-date'
import { formatPhone } from '@/shared/utils/format-phone'
import { STUDENT_STATUS_LABEL_KEYS, STUDENT_STATUS_VARIANTS } from '@/modules/students/enums/student-status.enum'
import { StatsStudentsKind } from '../../enums/stats-students-kind.enum'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import type { StatsStudentRow } from '../../interfaces/stats-details.interface'

const { t } = useI18n()
const props = defineProps<{ rows: Record<string, unknown>[]; kind: StatsStudentsKind; loading?: boolean; canOpen?: boolean }>()
const emit = defineEmits<{ open: [studentId: number] }>()

const DATE_KEYS: Record<StatsStudentsKind, string> = {
  [StatsStudentsKind.ACTIVE]: 'statistics.detail.col.startedOn',
  [StatsStudentsKind.STARTED]: 'statistics.detail.col.startedOn',
  [StatsStudentsKind.REGISTERED]: 'statistics.detail.col.registeredOn',
  [StatsStudentsKind.STOPPED]: 'statistics.detail.col.stoppedOn',
}
const r = (row: unknown) => row as StatsStudentRow
const rowClick = computed(() => (props.canOpen ? (row: Record<string, unknown>) => emit('open', r(row).id) : undefined))
const columns = computed<TableColumn[]>(() => [
  { key: 'fullName', label: t('statistics.detail.col.student'), primary: true },
  { key: 'phone', label: t('statistics.detail.col.phone') },
  { key: 'status', label: t('statistics.detail.col.status') },
  { key: 'date', label: t(DATE_KEYS[props.kind]) },
])
</script>
