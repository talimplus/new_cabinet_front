<template>
  <UiConfirmDialog
    :model-value="!!user"
    :title="unblocking ? t('users.unblock') : t('users.blockConfirm.title')"
    :message="message"
    :variant="unblocking ? 'primary' : 'danger'"
    :loading="loading"
    @confirm="emit('confirm')"
    @cancel="emit('cancel')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiConfirmDialog } from '@/shared/components'
import type { User } from '../interfaces/user.interface'

const { t } = useI18n()
const props = defineProps<{ user: User | null; loading?: boolean }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()

const unblocking = computed(() => props.user?.isActive === false)
const message = computed(() => {
  const name = props.user ? `${props.user.firstName} ${props.user.lastName}`.trim() : ''
  return unblocking.value
    ? t('users.blockConfirm.unblockText', { name })
    : t('users.blockConfirm.blockText', { name })
})
</script>
