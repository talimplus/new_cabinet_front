<template>
  <div class="space-y-3">
    <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_16rem]">
      <UiInput
        :model-value="filters.search"
        type="search"
        :placeholder="t('teacherDashboard.list.searchPlaceholder')"
        :aria-label="t('teacherDashboard.list.searchPlaceholder')"
        @update:model-value="emit('change', { search: String($event ?? '') })"
      >
        <template #prefix><UiIcon :icon="Search" :size="16" /></template>
      </UiInput>
      <UiSelect
        :model-value="filters.groupId"
        :options="groupOptions"
        :placeholder="t('teacherDashboard.list.allGroups')"
        @update:model-value="emit('change', { groupId: typeof $event === 'number' ? $event : null })"
      />
    </div>
    <UiTabs :tabs="tabs" :model-value="filters.status" @update:model-value="emit('change', { status: $event })" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiIcon, UiInput, UiSelect, UiTabs } from '@/shared/components'
import { Search } from '@/shared/icons'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { TabItem } from '@/shared/interfaces/tab-item.interface'
import type { GroupStudentsFilters } from '../interfaces/group-panel.interface'

const { t } = useI18n()
defineProps<{ filters: GroupStudentsFilters; tabs: TabItem[]; groupOptions: SelectOption[] }>()
const emit = defineEmits<{ change: [patch: Partial<GroupStudentsFilters>] }>()
</script>
