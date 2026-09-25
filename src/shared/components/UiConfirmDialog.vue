<template>
  <UiModal
    :model-value="modelValue"
    :title="title"
    size="sm"
    :close-on-overlay="!loading"
    @update:model-value="onModel"
  >
    <p class="text-sm text-muted-foreground">{{ message }}</p>

    <template #footer>
      <UiButton variant="ghost" :disabled="loading" @click="onCancel">
        {{ cancelLabel ?? t('common.cancel') }}
      </UiButton>
      <UiButton :variant="confirmVariant" :loading="loading" @click="emit('confirm')">
        {{ confirmLabel ?? t('common.confirm') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UiModal from './UiModal.vue'
import UiButton from './UiButton.vue'

const { t } = useI18n()

interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  /** `danger` for destructive actions (delete); `primary` for the rest. */
  variant?: 'danger' | 'primary'
  loading?: boolean
}
const props = withDefaults(defineProps<Props>(), { variant: 'primary' })
const emit = defineEmits<{ 'update:modelValue': [boolean]; confirm: []; cancel: [] }>()

const confirmVariant = computed(() => props.variant)

function onModel(open: boolean): void {
  emit('update:modelValue', open)
  if (!open) emit('cancel')
}
function onCancel(): void {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>
