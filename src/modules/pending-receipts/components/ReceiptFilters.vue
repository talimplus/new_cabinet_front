<template>
  <div class="space-y-2 rounded-lg border border-border bg-surface p-3 shadow-card">
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
import { UiDatepicker, UiButton, UiIcon } from '@/shared/components'
import { FilterX } from '@/shared/icons'

const { t } = useI18n()

defineProps<{ hasFilters?: boolean; disabled?: boolean }>()

const dateFrom = defineModel<Date | null>('dateFrom', { default: null })
const dateTo = defineModel<Date | null>('dateTo', { default: null })
const emit = defineEmits<{ change: []; reset: [] }>()

const models = { dateFrom, dateTo }
function update(key: keyof typeof models, value: Date | null): void {
  models[key].value = value
  emit('change')
}

const pickDate = (value: Date | Date[] | null): Date | null =>
  Array.isArray(value) ? (value[0] ?? null) : value
</script>
