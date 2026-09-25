<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <UiInput
      :model-value="fromMonth"
      type="month"
      :label="t('statistics.filters.fromMonth')"
      @update:model-value="emit('update:from', String($event))"
    />
    <UiInput
      :model-value="toMonth"
      type="month"
      :label="t('statistics.filters.toMonth')"
      @update:model-value="emit('update:to', String($event))"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiInput } from '@/shared/components'

const { t } = useI18n()

// The center is picked once in the header — this page only filters by period.
defineProps<{ fromMonth: string; toMonth: string }>()

const emit = defineEmits<{
  'update:from': [value: string]
  'update:to': [value: string]
}>()
</script>
