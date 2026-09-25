<template>
  <UiButton variant="ghost" :disabled="loading" @click="emit('cancel')">
    {{ t('common.cancel') }}
  </UiButton>
  <UiButton :loading="loading" :disabled="disabled" @click="emit('confirm')">
    {{ t('payments.dialog.confirm') }}
  </UiButton>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/shared/components'

const { t } = useI18n()

defineProps<{ loading?: boolean; disabled?: boolean }>()
const emit = defineEmits<{ cancel: []; confirm: [] }>()
</script>
