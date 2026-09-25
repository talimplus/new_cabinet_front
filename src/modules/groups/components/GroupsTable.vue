<template>
  <UiTable :columns="columns" :rows="rows as unknown as Row[]" :loading="loading" :empty-text="t('groups.empty')">
    <template #cell-subject="{ row }">{{ (row as Group).subject?.name ?? '—' }}</template>
    <template #cell-schedules="{ row }">
      <span class="text-xs text-muted-foreground">{{ scheduleText(row as Group) }}</span>
    </template>
    <template #cell-startDate="{ row }">
      <span class="font-mono text-xs">{{ formatDate((row as Group).startDate) }}</span>
    </template>
    <template #cell-endDate="{ row }">
      <UiBadge v-if="!(row as Group).endDate" variant="warning" :title="t('groups.noEndDateHint')">
        {{ t('groups.noEndDate') }}
      </UiBadge>
      <span v-else class="font-mono text-xs">{{ formatDate((row as Group).endDate) }}</span>
    </template>
    <template #cell-monthlyFee="{ row }">
      <div class="text-right">
        <span class="font-mono">{{ formatSom(feeNum((row as Group).monthlyFee)) }}</span>
        <p v-if="(row as Group).upcomingMonthlyFee != null" class="text-[11px] text-muted-foreground">
          {{ t('groups.table.upcomingFee', {
            date: formatDate((row as Group).upcomingFeeFromMonth),
            fee: formatSom(feeNum((row as Group).upcomingMonthlyFee)),
          }) }}
        </p>
      </div>
    </template>
    <template #cell-status="{ row }">
      <GroupStatusCell :status="(row as Group).status" :can-edit="canChangeStatus" @change="(s) => emit('status', row as Group, s)" />
    </template>
    <template #cell-room="{ row }">{{ (row as Group).room?.name ?? '—' }}</template>
    <template #cell-teacher="{ row }">{{ teacherName(row as Group) }}</template>
    <template #actions="{ row }">
      <div class="flex justify-end gap-1">
        <UiIconButton :icon="Eye" tone="primary" :label="t('common.view')" @click="emit('detail', row as Group)" />
        <UiIconButton v-if="canEdit" :icon="Pencil" tone="primary" :label="t('common.edit')" @click="emit('edit', row as Group)" />
        <UiIconButton v-if="canDelete" :icon="Trash2" tone="danger" :label="t('common.delete')" @click="emit('delete', row as Group)" />
      </div>
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable, UiBadge, UiIconButton } from '@/shared/components'
import { Eye, Pencil, Trash2 } from '@/shared/icons'
import { formatSom } from '@/shared/utils/format-money'
import { formatDate } from '@/shared/utils/format-date'
import GroupStatusCell from './GroupStatusCell.vue'
import { WEEK_DAY_SHORT_KEYS } from '../enums/week-day.enum'
import type { Group } from '../interfaces/group.interface'
import type { GroupStatus } from '../enums/group-status.enum'

type Row = Record<string, unknown>
const { t } = useI18n()

defineProps<{ rows: Group[]; loading?: boolean; canEdit?: boolean; canDelete?: boolean; canChangeStatus?: boolean }>()
const emit = defineEmits<{
  detail: [Group]; edit: [Group]; delete: [Group]; status: [Group, GroupStatus]
}>()

const feeNum = (v: number | string | null | undefined): number | null =>
  v == null || v === '' ? null : Number(v)
const scheduleText = (g: Group): string =>
  (g.schedules ?? []).map((s) => `${t(WEEK_DAY_SHORT_KEYS[s.day])} ${s.startTime}`).join(', ') || '—'
const teacherName = (g: Group): string =>
  g.teacher ? `${g.teacher.firstName ?? ''} ${g.teacher.lastName ?? ''}`.trim() || '—' : '—'

const columns = computed(() => [
  { key: 'name', label: t('groups.table.name'), primary: true },
  { key: 'subject', label: t('groups.table.subject') },
  { key: 'schedules', label: t('groups.table.schedules') },
  { key: 'startDate', label: t('groups.table.startDate') },
  { key: 'endDate', label: t('groups.table.endDate') },
  { key: 'monthlyFee', label: t('groups.table.monthlyFee'), align: 'right' as const },
  { key: 'status', label: t('groups.table.status') },
  { key: 'room', label: t('groups.table.room') },
  { key: 'teacher', label: t('groups.table.teacher') },
])
</script>
