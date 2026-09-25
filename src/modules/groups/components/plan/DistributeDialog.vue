<template>
  <UiModal
    :model-value="modelValue"
    :title="t('groups.plan.distributeTitle')"
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-3">
      <p class="rounded-md bg-warning-soft p-2 text-xs text-warning">
        {{ t('groups.plan.distributeWarning') }}
      </p>
      <UiInput
        type="number"
        :label="t('groups.plan.totalLessons')"
        :placeholder="t('groups.plan.totalLessonsPlaceholder')"
        :model-value="totalLessons ?? ''"
        @update:model-value="onTotal"
      />
      <UiTextarea
        :label="t('groups.plan.instructions')"
        :rows="3"
        :model-value="instructions"
        @update:model-value="(v: string) => emit('update:instructions', v)"
      />
    </div>
    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="loading" @click="emit('confirm')">{{ t('groups.plan.distribute') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { UiModal, UiInput, UiTextarea, UiButton } from '@/shared/components'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  modelValue: boolean
  totalLessons: number | null
  instructions: string
  loading?: boolean
}
defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:totalLessons': [value: number | null]
  'update:instructions': [value: string]
  confirm: []
}>()

function onTotal(value: string | number): void {
  emit('update:totalLessons', value === '' ? null : Number(value))
}
</script>
