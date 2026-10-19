<template>
  <div class="space-y-3 rounded-lg border border-border bg-surface p-4">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <h3 class="text-base font-semibold text-foreground">
        {{ t('staff.groups.title') }}
        <span class="text-muted-foreground">({{ groups.length }})</span>
      </h3>
      <p v-if="groups.length" class="text-xs text-muted-foreground">
        {{ t('staff.groups.totalStudents', { count: totalStudents }) }}
      </p>
    </div>

    <UiTable :columns="columns" :rows="(groups as unknown as Record<string, unknown>[])" :empty-text="t('staff.empty.groups')">
      <template #cell-name="{ row }">
        <RouterLink
          v-if="canViewGroups"
          :to="{ name: 'group-detail', params: { id: (row as StaffTeacherGroup).id } }"
          class="font-medium text-primary hover:underline"
        >
          {{ (row as StaffTeacherGroup).name }}
        </RouterLink>
        <span v-else class="font-medium">{{ (row as StaffTeacherGroup).name }}</span>
      </template>
      <template #cell-subject="{ row }">{{ (row as StaffTeacherGroup).subject ?? '—' }}</template>
      <template #cell-schedules="{ row }">
        <span class="text-xs">{{ scheduleText(row as StaffTeacherGroup) }}</span>
      </template>
      <template #cell-room="{ row }">{{ (row as StaffTeacherGroup).room ?? '—' }}</template>
      <template #cell-studentsCount="{ row }">
        <span class="font-mono">{{ (row as StaffTeacherGroup).studentsCount }}</span>
      </template>
      <template #cell-period="{ row }">
        <span class="font-mono text-xs">{{ periodText(row as StaffTeacherGroup) }}</span>
      </template>
      <template #cell-status="{ row }">
        <UiBadge :variant="(row as StaffTeacherGroup).status === GroupStatus.STARTED ? 'success' : 'info'">
          {{ t(GROUP_STATUS_LABEL_KEYS[(row as StaffTeacherGroup).status]) }}
        </UiBadge>
      </template>
    </UiTable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { UiTable, UiBadge } from '@/shared/components'
import { usePermissions } from '@/shared/composables/use-permissions'
import { formatDate } from '@/shared/utils/format-date'
import { GroupStatus, GROUP_STATUS_LABEL_KEYS } from '@/modules/groups/enums/group-status.enum'
import { WEEK_DAY_SHORT_KEYS } from '@/modules/groups/enums/week-day.enum'
import type { StaffTeacherGroup } from '../interfaces/staff-overview.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

const { t } = useI18n()
const { canViewGroups } = usePermissions()

const props = defineProps<{ groups: StaffTeacherGroup[] }>()

const totalStudents = computed(() => props.groups.reduce((sum, g) => sum + g.studentsCount, 0))

/** Days sharing a start time are joined: "Se, Pa, Sh 14:00". */
function scheduleText(g: StaffTeacherGroup): string {
  const byTime = new Map<string, string[]>()
  for (const s of g.schedules) byTime.set(s.startTime, [...(byTime.get(s.startTime) ?? []), t(WEEK_DAY_SHORT_KEYS[s.day])])
  return [...byTime].map(([time, days]) => `${days.join(', ')} ${time}`).join('; ') || '—'
}

const periodText = (g: StaffTeacherGroup): string =>
  `${g.startDate ? formatDate(g.startDate) : '—'} – ${g.endDate ? formatDate(g.endDate) : '…'}`

const columns = computed<TableColumn[]>(() => [
  { key: 'name', label: t('staff.groups.name'), primary: true },
  { key: 'subject', label: t('staff.groups.subject') },
  { key: 'schedules', label: t('staff.groups.schedule') },
  { key: 'room', label: t('staff.groups.room') },
  { key: 'studentsCount', label: t('staff.groups.students'), align: 'right' },
  { key: 'period', label: t('staff.groups.period') },
  { key: 'status', label: t('staff.groups.status') },
])
</script>
