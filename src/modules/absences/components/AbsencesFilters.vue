<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <UiInput type="date" :model-value="filters.from" :label="t('absences.filter.from')" @update:model-value="(v) => set('from', String(v ?? ''))" />
    <UiInput type="date" :model-value="filters.to" :label="t('absences.filter.to')" @update:model-value="(v) => set('to', String(v ?? ''))" />
    <UiSelect
      :model-value="filters.teacherId"
      :options="teacherOptions"
      :label="t('absences.filter.teacher')"
      clearable
      @update:model-value="(v) => emit('teacher', typeof v === 'number' ? v : null)"
    />
    <UiSelect
      :model-value="filters.groupId"
      :options="groupOptions"
      :label="t('absences.filter.group')"
      clearable
      @update:model-value="(v) => set('groupId', typeof v === 'number' ? v : null)"
    />
    <UiSelect :model-value="filters.status ?? ALL" :options="statusOptions" :clearable="false" :label="t('absences.filter.status')" @update:model-value="setStatus" />
    <UiSelect :model-value="filters.followUp" :options="followUpOptions" :clearable="false" :label="t('absences.filter.followUp')" @update:model-value="(v) => set('followUp', v as FollowUpFilter)" />
    <UiInput
      :model-value="filters.search"
      :label="t('absences.filter.search')"
      class="sm:col-span-2"
      @update:model-value="(v) => setSearch(String(v ?? ''))"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiInput, UiSelect } from '@/shared/components'
import { AttendanceStatus, ATTENDANCE_STATUS_LABEL_KEYS } from '@/modules/groups/enums/attendance-status.enum'
import { FollowUpFilter, FOLLOW_UP_FILTER_LABEL_KEYS } from '../enums/follow-up-filter.enum'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { AbsencesFilters } from '../composables/use-absences'

const ALL = 'all'
const { t } = useI18n()
defineProps<{ filters: AbsencesFilters; groupOptions: SelectOption[]; teacherOptions: SelectOption[] }>()
const emit = defineEmits<{ change: [patch: Partial<AbsencesFilters>]; search: [value: string]; teacher: [number | null] }>()

const statusOptions = computed<SelectOption[]>(() => [
  { label: t('absences.filter.statusAll'), value: ALL },
  ...[AttendanceStatus.ABSENT, AttendanceStatus.EXCUSED].map((s) => ({ label: t(ATTENDANCE_STATUS_LABEL_KEYS[s]), value: s })),
])
const followUpOptions = computed<SelectOption[]>(() =>
  Object.values(FollowUpFilter).map((f) => ({ label: t(FOLLOW_UP_FILTER_LABEL_KEYS[f]), value: f })),
)

function set<K extends 'from' | 'to' | 'groupId' | 'followUp'>(key: K, value: AbsencesFilters[K]): void {
  emit('change', { [key]: value })
}
function setStatus(v: unknown): void {
  emit('change', { status: v === AttendanceStatus.ABSENT || v === AttendanceStatus.EXCUSED ? v : null })
}
function setSearch(value: string): void {
  emit('search', value)
}
</script>
