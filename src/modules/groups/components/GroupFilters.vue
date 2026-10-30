<template>
  <div class="flex w-full flex-wrap items-center gap-3 sm:w-auto">
    <UiSelect
      :model-value="scope"
      :options="scopeOptions"
      :searchable="false"
      :clearable="false"
      :aria-label="t('groups.filter.scope')"
      class="w-full sm:w-48"
      @update:model-value="emit('update:scope', $event as GroupListScope)"
    />
    <UiSelect
      v-if="showTeacher"
      :model-value="teacherId"
      :options="options"
      :placeholder="t('groups.filter.teacher')"
      :aria-label="t('groups.filter.teacher')"
      clearable
      class="w-full sm:w-64"
      @update:model-value="emit('update:teacherId', typeof $event === 'number' ? $event : null)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiSelect } from '@/shared/components'
import { GroupListScope, GROUP_LIST_SCOPE_LABEL_KEYS } from '../enums/group-list-scope.enum'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const { t } = useI18n()

defineProps<{
  scope: GroupListScope
  teacherId: number | null
  options: SelectOption[]
  /** A teacher never picks a teacher — the backend already scopes them. */
  showTeacher?: boolean
}>()
const emit = defineEmits<{ 'update:teacherId': [number | null]; 'update:scope': [GroupListScope] }>()

const scopeOptions = computed<SelectOption[]>(() =>
  Object.values(GroupListScope).map((v) => ({ label: t(GROUP_LIST_SCOPE_LABEL_KEYS[v]), value: v })),
)
</script>
