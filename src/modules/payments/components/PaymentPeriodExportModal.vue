<template>
  <UiModal
    :model-value="open"
    :title="t('payments.export.periodTitle')"
    size="sm"
    @update:model-value="emit('close')"
  >
    <div class="space-y-3">
      <UiDatepicker
        :model-value="from"
        :label="t('payments.export.dateFrom')"
        :disabled="loading"
        @update:model-value="emit('update:from', pickDate($event))"
      />
      <UiDatepicker
        :model-value="to"
        :label="t('payments.export.dateTo')"
        :disabled="loading"
        @update:model-value="emit('update:to', pickDate($event))"
      />
      <p class="text-xs text-muted-foreground">{{ t('payments.export.hint') }}</p>
    </div>

    <template #footer>
      <UiButton variant="ghost" :disabled="loading" @click="emit('close')">
        {{ t('common.cancel') }}
      </UiButton>
      <UiButton :loading="loading" @click="emit('confirm')">
        <UiIcon :icon="Download" :size="16" />
        {{ t('payments.export.download') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiModal, UiButton, UiDatepicker, UiIcon } from '@/shared/components'
import { Download } from '@/shared/icons'

const { t } = useI18n()

defineProps<{ open: boolean; from: Date | null; to: Date | null; loading?: boolean }>()
const emit = defineEmits<{
  close: []
  confirm: []
  'update:from': [value: Date | null]
  'update:to': [value: Date | null]
}>()

const pickDate = (value: Date | Date[] | null): Date | null =>
  Array.isArray(value) ? (value[0] ?? null) : value
</script>
