<template>
  <div class="flex flex-col items-center gap-4 py-12 text-center">
    <div
      class="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-muted-foreground"
    >
      <UiIcon :icon="BookOpen" :size="28" />
    </div>
    <p class="text-sm text-muted-foreground">{{ t('groups.plan.noSyllabus') }}</p>

    <div v-if="canEdit" class="w-full max-w-sm space-y-3">
      <UiSelect
        :model-value="modelValue"
        :options="options"
        :placeholder="t('groups.plan.selectSyllabus')"
        :disabled="loading"
        @update:model-value="onSelect"
      />
      <UiButton block :disabled="modelValue === null" :loading="attaching" @click="emit('attach')">
        {{ t('groups.plan.attach') }}
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiSelect, UiButton, UiIcon } from '@/shared/components'
import { BookOpen } from '@/shared/icons'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  modelValue: number | null
  options: SelectOption[]
  loading?: boolean
  attaching?: boolean
  canEdit?: boolean
}
defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: number | null]; attach: [] }>()

function onSelect(value: string | number | Array<string | number> | null): void {
  emit('update:modelValue', typeof value === 'number' ? value : null)
}
</script>
