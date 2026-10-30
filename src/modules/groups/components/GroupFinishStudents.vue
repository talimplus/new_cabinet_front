<template>
  <div class="rounded-md border border-border">
    <div class="border-b border-border px-3 py-2">
      <UiCheckbox :model-value="allSelected" :indeterminate="someSelected" :label="t('groups.finish.selectAll', { count: members.length })" @update:model-value="emit('toggle-all', !!$event)" />
    </div>
    <ul class="max-h-64 divide-y divide-border overflow-y-auto text-sm">
      <li v-for="m in members" :key="m.studentId" class="flex items-center justify-between gap-3 px-3 py-2">
        <UiCheckbox :model-value="selected.includes(m.studentId)" @update:model-value="emit('toggle', m.studentId, !!$event)">
          {{ m.lastName }} {{ m.firstName }}
        </UiCheckbox>
        <span class="shrink-0 text-right font-mono text-xs">
          <span v-if="m.debt" class="block text-danger">{{ t('groups.formerStudents.debt', { amount: formatSom(m.debt) }) }}</span>
          <span v-if="m.pending" class="block text-warning">{{ t('groups.formerStudents.pending', { amount: formatSom(m.pending) }) }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiCheckbox } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import type { GroupMember } from '../interfaces/group-member.interface'

const { t } = useI18n()

const props = defineProps<{ members: GroupMember[]; selected: number[] }>()
const emit = defineEmits<{ toggle: [id: number, on: boolean]; 'toggle-all': [on: boolean] }>()

const allSelected = computed(() => props.members.length > 0 && props.selected.length === props.members.length)
const someSelected = computed(() => props.selected.length > 0 && !allSelected.value)
</script>
