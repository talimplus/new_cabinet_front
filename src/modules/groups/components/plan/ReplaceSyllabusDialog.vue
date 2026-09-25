<template>
  <UiModal
    :model-value="modelValue"
    :title="t('groups.plan.replaceTitle')"
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-3">
      <p class="rounded-md bg-warning-soft p-2 text-xs text-warning">
        {{ t('groups.plan.replaceWarning') }}
      </p>
      <UiSelect
        :model-value="selected"
        :options="options"
        :placeholder="t('groups.plan.selectSyllabus')"
        :disabled="loading"
        @update:model-value="onSelect"
      />
    </div>
    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="saving" :disabled="selected === null" @click="confirm">
        {{ t('groups.plan.replace') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiSelect, UiButton } from '@/shared/components'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const { t } = useI18n()

interface Props {
  modelValue: boolean
  options: SelectOption[]
  loading?: boolean
  saving?: boolean
}
defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; confirm: [id: number] }>()

const selected = ref<number | null>(null)

function onSelect(value: string | number | Array<string | number> | null): void {
  selected.value = typeof value === 'number' ? value : null
}
function confirm(): void {
  if (selected.value !== null) emit('confirm', selected.value)
}
</script>
