<template>
  <UiSelect
    :model-value="teacherId"
    :options="options"
    :placeholder="t('groups.filter.teacher')"
    :aria-label="t('groups.filter.teacher')"
    clearable
    class="w-full sm:w-64"
    @update:model-value="emit('update:teacherId', typeof $event === 'number' ? $event : null)"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiSelect } from '@/shared/components'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const { t } = useI18n()

defineProps<{ teacherId: number | null; options: SelectOption[] }>()
const emit = defineEmits<{ 'update:teacherId': [number | null] }>()
</script>
