<template>
  <UiModal :model-value="modelValue" :title="t('candidates.deleteTitle')" size="sm" @update:model-value="emit('update:modelValue', $event)">
    <p class="text-sm text-foreground">
      <strong>{{ name }}</strong> {{ t('candidates.confirmDeleteSuffix') }}
    </p>
    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton variant="danger" :loading="loading" @click="emit('confirm')">{{ t('common.delete') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiModal, UiButton } from '@/shared/components'

const { t } = useI18n()

defineProps<{ modelValue: boolean; name: string; loading?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; confirm: [] }>()
</script>
