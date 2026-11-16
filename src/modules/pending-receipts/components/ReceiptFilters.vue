<template>
  <div class="space-y-2 rounded-lg border border-border bg-surface p-3 shadow-card">
    <UiInput type="search" :model-value="search" :placeholder="t('pendingReceipts.filters.search')" @input="onSearch">
      <template #prefix><UiIcon :icon="Search" :size="16" /></template>
    </UiInput>
    <div class="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <UiDatepicker
        :model-value="dateFrom"
        :label="t('pendingReceipts.filters.dateFrom')"
        :disabled="disabled"
        @update:model-value="update('dateFrom', pickDate($event))"
      />
      <UiDatepicker
        :model-value="dateTo"
        :label="t('pendingReceipts.filters.dateTo')"
        :disabled="disabled"
        @update:model-value="update('dateTo', pickDate($event))"
      />
      <UiButton variant="ghost" :disabled="!hasFilters || disabled" @click="emit('reset')">
        <UiIcon :icon="FilterX" :size="16" />
        {{ t('pendingReceipts.filters.reset') }}
      </UiButton>
    </div>
    <p class="text-xs text-muted-foreground">{{ t('pendingReceipts.filters.hint') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiDatepicker, UiButton, UiIcon, UiInput } from '@/shared/components'
import { FilterX, Search } from '@/shared/icons'
import { debounce } from '@/shared/utils/debounce'

const { t } = useI18n()

defineProps<{ hasFilters?: boolean; disabled?: boolean; search?: string }>()

const dateFrom = defineModel<Date | null>('dateFrom', { default: null })
const dateTo = defineModel<Date | null>('dateTo', { default: null })
const emit = defineEmits<{ change: []; reset: []; search: [value: string] }>()
const onSearch = debounce((ev: Event) => emit('search', (ev.target as HTMLInputElement).value))

const models = { dateFrom, dateTo }
function update(key: keyof typeof models, value: Date | null): void {
  models[key].value = value
  emit('change')
}

const pickDate = (value: Date | Date[] | null): Date | null =>
  Array.isArray(value) ? (value[0] ?? null) : value
</script>
