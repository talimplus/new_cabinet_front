<template>
  <UiConfirmDialog
    :model-value="open"
    :title="t('students.delete.title')"
    :message="t('students.delete.message', { name })"
    :confirm-label="t('common.delete')"
    :cancel-label="t('common.cancel')"
    variant="danger"
    :loading="loading"
    @confirm="emit('confirm')"
    @cancel="emit('cancel')"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiConfirmDialog } from '@/shared/components'

const { t } = useI18n()

defineProps<{ open: boolean; name: string; loading?: boolean }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>
