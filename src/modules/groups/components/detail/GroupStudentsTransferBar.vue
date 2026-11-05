<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <UiCheckbox
      :model-value="allSelected"
      :indeterminate="someSelected"
      :label="t('groups.studentTable.selectAll')"
      @update:model-value="emit('toggleAll')"
    />
    <div class="flex items-center gap-3">
      <span class="text-sm text-muted-foreground">
        {{ selectedCount ? t('students.transfer.subtitle', { count: selectedCount }) : t('students.transfer.selectStudents') }}
      </span>
      <UiButton size="sm" :disabled="!selectedCount" @click="emit('transfer')">
        <UiIcon :icon="ArrowLeftRight" :size="16" />{{ t('students.transfer.action') }}
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiButton, UiCheckbox, UiIcon } from '@/shared/components'
import { ArrowLeftRight } from '@/shared/icons'

const { t } = useI18n()

defineProps<{ allSelected: boolean; someSelected: boolean; selectedCount: number }>()
const emit = defineEmits<{ toggleAll: []; transfer: [] }>()
</script>
