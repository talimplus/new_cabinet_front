<template>
  <UiModal
    :model-value="modelValue"
    :title="t('roles.remove.title')"
    size="sm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="text-sm text-foreground">
      {{ t('roles.remove.confirm', { name: role?.name ?? '' }) }}
    </p>
    <template #footer>
      <UiButton variant="outline" :disabled="loading" @click="emit('update:modelValue', false)">
        {{ t('common.cancel') }}
      </UiButton>
      <UiButton variant="danger" :loading="loading" @click="emit('confirm')">
        {{ t('common.delete') }}
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
