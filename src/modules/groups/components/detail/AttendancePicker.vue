<template>
  <div class="flex flex-wrap items-center gap-2">
    <UiSelect
      :model-value="month"
      :options="monthOptions"
      :searchable="false"
      :clearable="false"
      class="w-36"
      @update:model-value="(v) => emit('update:month', Number(v))"
    />
    <UiSelect
      :model-value="year"
      :options="yearOptions"
      :searchable="false"
      :clearable="false"
      class="w-32"
      @update:model-value="(v) => emit('update:year', Number(v))"
    />
    <UiButton variant="outline" size="sm" @click="emit('current')">
      <UiIcon :icon="CalendarDays" :size="16" />
      {{ t('groups.attendance.currentMonth') }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiSelect, UiButton, UiIcon } from '@/shared/components'
import { CalendarDays } from '@/shared/icons'

const { t } = useI18n()

defineProps<{ month: number; year: number }>()
const emit = defineEmits<{ 'update:month': [number]; 'update:year': [number]; current: [] }>()

const monthOptions = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({
    label: t(`common.months.${String(i + 1).padStart(2, '0')}`),
    value: i + 1,
  })),
)
const yearOptions = computed(() => {
  const current = new Date().getFullYear()
  return Array.from({ length: 4 }, (_, i) => ({ label: String(current - i), value: current - i }))
})
</script>
