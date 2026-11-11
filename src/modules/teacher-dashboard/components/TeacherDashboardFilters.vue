<template>
  <div class="grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
    <UiInput
      :model-value="month"
      type="month"
      :label="t('teacherDashboard.filters.month')"
      @update:model-value="emit('update:month', String($event ?? ''))"
    />
    <!-- A teacher always sees themself; others pick whose figures to open. -->
    <UiSelect
      v-if="showTeacher"
      :model-value="teacherId"
      :options="teacherOptions"
      :label="t('teacherDashboard.filters.teacher')"
      :placeholder="t('teacherDashboard.filters.teacherPlaceholder')"
      searchable
      @update:model-value="emit('update:teacherId', typeof $event === 'number' ? $event : null)"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiInput, UiSelect } from '@/shared/components'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const { t } = useI18n()

defineProps<{
  month: string
  teacherId: number | null
  teacherOptions: SelectOption[]
  showTeacher: boolean
}>()
const emit = defineEmits<{ 'update:month': [value: string]; 'update:teacherId': [value: number | null] }>()
</script>
