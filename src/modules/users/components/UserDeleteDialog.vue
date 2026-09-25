<template>
  <UiModal
    :model-value="modelValue"
    :title="t('users.remove.title')"
    size="sm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="text-sm text-muted-foreground">
      <span v-if="user" class="font-medium text-foreground">{{ user.firstName }} {{ user.lastName }}</span>
      {{ t('users.remove.question') }}
    </p>

    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton variant="danger" :loading="loading" @click="emit('confirm')">{{ t('common.delete') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { UiModal, UiButton } from '@/shared/components'
import { useI18n } from 'vue-i18n'
import type { User } from '../interfaces/user.interface'

const { t } = useI18n()

defineProps<{ modelValue: boolean; user: User | null; loading?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; confirm: [] }>()
</script>
