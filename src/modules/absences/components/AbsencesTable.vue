<template>
  <UiTable :columns="columns" :rows="rows as unknown as Row[]" :loading="loading" :empty-text="t('common.noData')">
    <template #cell-student="{ row }">
      <span class="font-semibold text-foreground">{{ person((row as Absence).student) }}</span>
      <UiBadge v-if="(row as Absence).absencesInRange > 1" variant="danger" class="ml-2" :title="t('absences.table.timesHint')">
        {{ (row as Absence).absencesInRange }} {{ t('absences.table.times') }}
      </UiBadge>
    </template>
    <template #cell-phone="{ row }">
      <div class="flex flex-col">
        <a
          v-for="phone in phones(row as Absence)"
          :key="phone"
          :href="`tel:${phone}`"
          class="inline-flex min-h-11 items-center font-mono text-sm text-primary hover:underline md:min-h-0"
        >{{ phone }}</a>
      </div>
    </template>
    <template #cell-group="{ row }">
      <div>{{ (row as Absence).group.name }}</div>
      <div v-if="(row as Absence).teacher" class="text-xs text-muted-foreground">{{ person((row as Absence).teacher!) }}</div>
    </template>
    <template #cell-date="{ row }"><span class="font-mono text-xs">{{ formatDate((row as Absence).lessonDate) }}</span></template>
    <template #cell-status="{ row }">
      <UiBadge :variant="ATTENDANCE_STATUS_VARIANTS[(row as Absence).status]">{{ t(ATTENDANCE_STATUS_LABEL_KEYS[(row as Absence).status]) }}</UiBadge>
    </template>
    <template #cell-reason="{ row }">
      <p v-if="(row as Absence).comment" class="text-xs text-muted-foreground">
        {{ t('absences.table.teacherNote') }}: {{ (row as Absence).comment }}
      </p>
      <template v-if="(row as Absence).followUpNote">
        <p class="text-sm text-foreground">{{ (row as Absence).followUpNote }}</p>
        <p class="text-[11px] text-muted-foreground">{{ followUpMeta(row as Absence) }}</p>
      </template>
    </template>
    <template #actions="{ row }">
      <div class="flex justify-end gap-1">
        <UiButton v-if="canManage" size="sm" :variant="(row as Absence).followUpNote ? 'ghost' : 'outline'" @click="emit('follow-up', row as Absence)">
          {{ (row as Absence).followUpNote ? t('absences.table.edit') : t('absences.table.record') }}
        </UiButton>
      </div>
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable, UiBadge, UiButton } from '@/shared/components'
import { formatDate, formatDateTime } from '@/shared/utils/format-date'
import { ATTENDANCE_STATUS_LABEL_KEYS, ATTENDANCE_STATUS_VARIANTS } from '@/modules/groups/enums/attendance-status.enum'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import type { Absence, AbsencePerson } from '../interfaces/absence.interface'

type Row = Record<string, unknown>
const { t } = useI18n()
defineProps<{ rows: Absence[]; loading?: boolean; canManage?: boolean }>()
const emit = defineEmits<{ 'follow-up': [Absence] }>()

const person = (p: AbsencePerson): string => `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()
const phones = (r: Absence): string[] =>
  [r.student.phone, r.student.secondPhone].filter((p): p is string => Boolean(p))
const followUpMeta = (r: Absence): string =>
  t('absences.table.followUpBy', {
    name: r.followedUpBy ? person(r.followedUpBy) : '—',
    date: formatDateTime(r.followedUpAt),
  })

const columns = computed<TableColumn[]>(() => [
  { key: 'student', label: t('absences.table.student'), primary: true },
  { key: 'phone', label: t('absences.table.phone') },
  { key: 'group', label: t('absences.table.group') },
  { key: 'date', label: t('absences.table.date') },
  { key: 'status', label: t('absences.table.status') },
  { key: 'reason', label: t('absences.table.reason') },
])
</script>
