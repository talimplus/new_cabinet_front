<template>
  <UiModal :model-value="modelValue" :title="t('groups.reschedule.title')" size="sm" @update:model-value="emit('update:modelValue', $event)">
    <div class="space-y-4">
      <p v-if="fromDate" class="text-sm text-muted-foreground">
        {{ t('groups.reschedule.hint', { date: formatDate(fromDate) }) }}
      </p>
      <UiDatepicker
        :model-value="toDate"
        :label="t('groups.reschedule.newDate')"
        required
        @update:model-value="emit('update:toDate', $event as Date | null)"
      />
      <UiTextarea
        :model-value="reason"
        :label="t('groups.reschedule.reason')"
        :rows="2"
        @update:model-value="emit('update:reason', $event)"
      />
    </div>

    <template #footer>
      <UiButton variant="ghost" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="saving" :disabled="!toDate" @click="emit('submit')">{{ t('groups.reschedule.submit') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { UiModal, UiDatepicker, UiTextarea, UiButton } from '@/shared/components'
import { useI18n } from 'vue-i18n'
import { formatDate } from '@/shared/utils/format-date'

const { t } = useI18n()

defineProps<{
  modelValue: boolean
  fromDate?: string
  toDate: Date | null
  reason: string
  saving?: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:toDate': [value: Date | null]
  'update:reason': [value: string]
  submit: []
}>()
</script>
