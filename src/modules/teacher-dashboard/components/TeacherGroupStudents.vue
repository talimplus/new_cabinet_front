<template>
  <UiTable
    :columns="columns"
    :rows="rows as unknown as Record<string, unknown>[]"
    row-key="key"
    :empty-text="t('teacherDashboard.student.empty')"
    :row-class="(row) => (asRow(row).leftAt ? 'opacity-70' : undefined)"
    :row-click="canOpen ? (row) => emit('open', asRow(row).studentId) : undefined"
  >
    <template #cell-name="{ row }">
      <span class="font-medium text-foreground">{{ asRow(row).lastName }} {{ asRow(row).firstName }}</span>
      <span v-if="note(asRow(row))" class="block text-xs text-muted-foreground">{{ note(asRow(row)) }}</span>
    </template>
    <template #cell-phone="{ row }">
      <span class="font-mono whitespace-nowrap">{{ formatPhone(asRow(row).phone) || '—' }}</span>
    </template>
    <template #cell-state="{ row }">
      <UiBadge :variant="STUDENT_PAY_STATE_VARIANTS[asRow(row).state]">{{ t(STUDENT_PAY_STATE_LABEL_KEYS[asRow(row).state]) }}</UiBadge>
      <span v-if="asRow(row).pendingAmount > 0" class="block text-xs text-info">
        {{ t('teacherDashboard.student.pendingNote', { amount: formatSom(asRow(row).pendingAmount) }) }}
      </span>
    </template>
    <template #cell-paid="{ row }">
      <span v-if="asRow(row).monthStatus" class="font-mono whitespace-nowrap">
        {{ formatMoney(asRow(row).amountPaid) }} / {{ formatSom(asRow(row).amountDue) }}
      </span>
      <span v-else class="text-muted-foreground">—</span>
    </template>
    <template #cell-monthDebt="{ row }">
      <span :class="['font-mono whitespace-nowrap', asRow(row).monthDebt > 0 ? 'font-semibold text-danger' : 'text-muted-foreground']">
        {{ asRow(row).monthStatus ? formatSom(asRow(row).monthDebt) : '—' }}
      </span>
    </template>
    <template #cell-totalDebt="{ row }">
      <template v-if="asRow(row).totalDebt > 0">
        <span class="font-mono font-semibold whitespace-nowrap text-danger">{{ formatSom(asRow(row).totalDebt) }}</span>
        <span class="block text-xs text-muted-foreground">{{ t('teacherDashboard.student.months', { count: asRow(row).debtMonths }) }}</span>
      </template>
      <span v-else class="text-xs text-success">{{ t('teacherDashboard.student.noDebt') }}</span>
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiBadge, UiTable } from '@/shared/components'
import { formatMoney, formatSom } from '@/shared/utils/format-money'
import { formatPhone } from '@/shared/utils/format-phone'
import { formatDate } from '@/shared/utils/format-date'
import { STUDENT_PAY_STATE_LABEL_KEYS, STUDENT_PAY_STATE_VARIANTS } from '../enums/student-pay-state.enum'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import type { GroupStudentRow } from '../interfaces/group-panel.interface'

const { t } = useI18n()
defineProps<{ rows: GroupStudentRow[]; canOpen?: boolean }>()
const emit = defineEmits<{ open: [studentId: number] }>()

const asRow = (row: unknown): GroupStudentRow => row as GroupStudentRow

/** A student who already left the group still shows (old debt) — say so under the name. */
const note = (r: GroupStudentRow): string =>
  r.leftAt ? t('teacherDashboard.student.leftOn', { date: formatDate(r.leftAt) }) : ''

const columns = computed<TableColumn[]>(() => [
  { key: 'name', label: t('teacherDashboard.student.name'), primary: true },
  { key: 'state', label: t('teacherDashboard.student.state') },
  { key: 'paid', label: t('teacherDashboard.student.paid'), align: 'right' },
  { key: 'monthDebt', label: t('teacherDashboard.student.monthDebt'), align: 'right' },
  { key: 'totalDebt', label: t('teacherDashboard.student.totalDebt'), align: 'right' },
  { key: 'phone', label: t('teacherDashboard.student.phone') },
])
</script>
