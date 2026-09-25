<template>
  <UiModal
    :model-value="open"
    :title="t('telegram.parentCard.regenerateTitle')"
    size="sm"
    @update:model-value="emit('close')"
  >
    <p class="text-sm text-foreground">{{ t('telegram.parentCard.regenerateConfirm') }}</p>
    <template #footer>
      <UiButton variant="ghost" :disabled="loading" @click="emit('close')">
        {{ t('common.cancel') }}
      </UiButton>
      <UiButton :loading="loading" @click="emit('confirm')">
        {{ t('telegram.parentCard.regenerate') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiModal, UiButton } from '@/shared/components'

const { t } = useI18n()

defineProps<{ open: boolean; loading?: boolean }>()
const emit = defineEmits<{ close: []; confirm: [] }>()
</script>
