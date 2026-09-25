<template>
  <div class="flex flex-wrap items-end gap-3">
    <UiInput
      type="date"
      :model-value="filters.from"
      :label="t('staffAttendance.filter.from')"
      class="w-full sm:w-44"
      @update:model-value="(v) => update('from', String(v))"
    />
    <UiInput
      type="date"
      :model-value="filters.to"
      :label="t('staffAttendance.filter.to')"
      class="w-full sm:w-44"
      @update:model-value="(v) => update('to', String(v))"
    />
    <template v-if="isLog">
      <UiSelect
        :model-value="filters.userId"
        :options="employees"
        :placeholder="t('staffAttendance.filter.staff')"
        :aria-label="t('staffAttendance.filter.staff')"
        clearable
        class="w-full sm:w-56"
        @update:model-value="(v) => setUser(typeof v === 'number' ? v : null)"
      />
      <UiCheckbox
        :model-value="filters.onlyLate"
        :label="t('staffAttendance.filter.onlyLate')"
        @update:model-value="(v) => setFlag('onlyLate', v)"
      />
      <UiCheckbox
        :model-value="filters.onlyFlagged"
        :label="t('staffAttendance.filter.onlyFlagged')"
        @update:model-value="(v) => setFlag('onlyFlagged', v)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiInput, UiSelect, UiCheckbox } from '@/shared/components'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const { t } = useI18n()

interface Filters {
  from: string
  to: string
  userId: number | null
  onlyLate: boolean
  onlyFlagged: boolean
}
const props = defineProps<{ filters: Filters; employees: SelectOption[]; isLog: boolean }>()
const emit = defineEmits<{ reload: []; reloadLog: [] }>()

// Date changes reload both tabs; the log-only filters reload just the log.
function update(key: 'from' | 'to', value: string): void {
  props.filters[key] = value
  emit('reload')
}
function setUser(id: number | null): void {
  props.filters.userId = id
  emit('reloadLog')
}
function setFlag(key: 'onlyLate' | 'onlyFlagged', value: boolean): void {
  props.filters[key] = value
  emit('reloadLog')
}
</script>
