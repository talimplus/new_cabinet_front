<template>
  <UiModal
    :model-value="modelValue"
    :title="t('roles.reset.title')"
    size="sm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="text-sm text-foreground">
      {{ t('roles.reset.confirm', { name: role?.name ?? '' }) }}
    </p>
    <p class="mt-2 text-sm text-muted-foreground">{{ t('roles.reset.hint') }}</p>
    <template #footer>
      <UiButton variant="outline" :disabled="loading" @click="emit('update:modelValue', false)">
        {{ t('common.cancel') }}
      </UiButton>
      <UiButton :loading="loading" @click="emit('confirm')">
        {{ t('roles.reset.action') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiModal, UiButton } from '@/shared/components'
import type { Role } from '../interfaces/role.interface'

const { t } = useI18n()

defineProps<{ modelValue: boolean; role: Role | null; loading?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; confirm: [] }>()
</script>
