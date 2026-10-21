<template>
  <div v-if="scheduleChanged" class="rounded-md bg-info-soft p-3">
    <UiDatepicker
      :model-value="scheduleFrom"
      :enable-time="false"
      :label="t('groups.form.scheduleEffectiveFrom')"
      :error="error"
      @update:model-value="emit('update:scheduleFrom', pick($event))"
    />
    <p class="mt-1 text-xs text-info">{{ t('groups.form.scheduleEffectiveFromHint') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiDatepicker } from '@/shared/components'

const { t } = useI18n()
defineProps<{
  scheduleChanged: boolean
  scheduleFrom: Date | null
  error?: string
}>()
const emit = defineEmits<{ 'update:scheduleFrom': [Date | null] }>()

const pick = (v: Date | Date[] | null): Date | null => (Array.isArray(v) ? (v[0] ?? null) : v)
</script>
