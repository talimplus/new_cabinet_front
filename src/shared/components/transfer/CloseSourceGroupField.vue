<template>
  <UiCheckbox
    :model-value="modelValue"
    :label="t('students.transfer.closeSourceGroup')"
    :disabled="disabled"
    @update:model-value="onToggle"
  />
  <!-- An inline warning went unread — closing the group is asked in its own dialog. -->
  <UiConfirmDialog
    v-model="asking"
    variant="danger"
    :title="t('students.transfer.closeSourceGroupConfirmTitle')"
    :message="t('students.transfer.closeSourceGroupWarning', { name: groupName })"
    :confirm-label="t('students.transfer.closeSourceGroupConfirm')"
    @confirm="onConfirm"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiCheckbox, UiConfirmDialog } from '@/shared/components'

const { t } = useI18n()

defineProps<{ modelValue: boolean; groupName?: string | null; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const asking = ref(false)

/** Ticking asks first; unticking needs no confirmation. Cancel leaves it unticked. */
function onToggle(value: boolean): void {
  if (value) asking.value = true
  else emit('update:modelValue', false)
}

function onConfirm(): void {
  asking.value = false
  emit('update:modelValue', true)
}
</script>
