<template>
  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <UiSelect
      :model-value="filters.status"
      :options="statusOptions"
      :searchable="false"
      :placeholder="t('leads.filter.status')"
      @update:model-value="setField('status', $event as LeadStatus | null)"
    />
    <UiDatepicker
      :model-value="filters.followUpDate"
      :placeholder="t('leads.filter.followUpDate')"
      @update:model-value="setField('followUpDate', ($event as Date | null))"
    />
    <UiInput :model-value="filters.name" type="search" :placeholder="t('leads.searchByName')" @input="onName">
      <template #prefix><UiIcon :icon="Search" :size="16" /></template>
    </UiInput>
    <UiInput :model-value="filters.phone" type="search" :placeholder="t('leads.searchByPhone')" @input="onPhone">
      <template #prefix><UiIcon :icon="Search" :size="16" /></template>
    </UiInput>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UiSelect, UiInput, UiDatepicker, UiIcon } from '@/shared/components'
import { Search } from '@/shared/icons'
import { debounce } from '@/shared/utils/debounce'
import { LeadStatus, LEAD_STATUS_LABEL_KEYS } from '../enums/lead-status.enum'
import type { LeadFiltersState } from '../composables/use-leads'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  filters: LeadFiltersState
}>()
const emit = defineEmits<{ change: [] }>()

const statusOptions = computed(() =>
  Object.values(LeadStatus).map((v) => ({ label: t(LEAD_STATUS_LABEL_KEYS[v]), value: v })),
)

function setField<K extends keyof LeadFiltersState>(key: K, value: LeadFiltersState[K]): void {
  props.filters[key] = value
  emit('change')
}
const onName = debounce((e: Event) => setField('name', (e.target as HTMLInputElement).value))
const onPhone = debounce((e: Event) => setField('phone', (e.target as HTMLInputElement).value))
</script>
