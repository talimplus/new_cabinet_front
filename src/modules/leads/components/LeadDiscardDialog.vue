<template>
  <UiModal :model-value="modelValue" :title="t('leads.dialog.reasonTitle')" size="sm" @update:model-value="emit('update:modelValue', $event)">
    <UiTextarea v-model="reason" :label="t('leads.dialog.reasonLabel')" :rows="3" />
    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton variant="danger" @click="onConfirm">{{ t('leads.dialog.notInterested') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiTextarea, UiButton } from '@/shared/components'

const { t } = useI18n()

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [reason: string]
}>()

const reason = ref('')
watch(() => props.modelValue, (open) => { if (open) reason.value = '' })

function onConfirm() {
  emit('confirm', reason.value.trim())
}
</script>
