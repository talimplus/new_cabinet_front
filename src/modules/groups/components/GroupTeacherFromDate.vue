<template>
  <!-- Shown only when a different teacher was picked on edit. -->
  <div class="rounded-md bg-info-soft p-3">
    <UiDatepicker
      :model-value="modelValue"
      :enable-time="false"
      :clearable="false"
      :max-date="today"
      :label="t('groups.form.teacherEffectiveFrom')"
      :error="error"
      @update:model-value="emit('update:modelValue', pick($event))"
    />
    <p class="mt-1 text-xs text-info">{{ t('groups.form.teacherEffectiveFromHint') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiDatepicker } from '@/shared/components'

const { t } = useI18n()
defineProps<{
  modelValue: Date | null
  /** Backend 422 `errors.teacherEffectiveFrom`, shown verbatim under the picker. */
  error?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [Date | null] }>()

/** The switch can't be scheduled ahead — the backend rejects a future day. */
const today = new Date()
const pick = (v: Date | Date[] | null): Date | null => (Array.isArray(v) ? (v[0] ?? null) : v)
</script>
