<template>
  <UiTable
    :columns="columns"
    :rows="rows as unknown as Record<string, unknown>[]"
    :loading="loading"
    :empty-text="t('syllabuses.empty')"
  >
    <template #cell-id="{ row }">
      <span class="font-mono text-muted-foreground">{{ (row as SyllabusListItem).id }}</span>
    </template>
    <template #cell-name="{ row }">
      <RouterLink
        :to="`/syllabuses/${(row as SyllabusListItem).id}`"
        class="font-medium text-primary hover:underline"
      >
        {{ (row as SyllabusListItem).name }}
      </RouterLink>
    </template>
    <template #cell-subject="{ row }">{{
      (row as SyllabusListItem).subject?.name ?? '—'
    }}</template>
    <template #cell-topicsCount="{ row }">
      <UiBadge variant="primary">{{ (row as SyllabusListItem).topicsCount }}</UiBadge>
    </template>
    <template #cell-createdAt="{ row }">
      <span class="font-mono">{{ formatDate((row as SyllabusListItem).createdAt) }}</span>
    </template>
    <template #actions="{ row }">
      <div class="flex justify-end gap-1">
        <RouterLink
          :to="`/syllabuses/${(row as SyllabusListItem).id}`"
          class="rounded-md p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-primary"
        >
          <UiIcon :icon="canManage ? Pencil : Eye" :size="16" />
        </RouterLink>
        <UiIconButton
          v-if="canManage"
          :icon="Trash2"
          tone="danger"
          :label="t('common.delete')"
          @click="emit('delete', row as SyllabusListItem)"
        />
      </div>
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { UiTable, UiBadge, UiIcon, UiIconButton } from '@/shared/components'
import { Pencil, Eye, Trash2 } from '@/shared/icons'
import { formatDate } from '@/shared/utils/format-date'
import type { SyllabusListItem } from '../interfaces/syllabus.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{ rows: SyllabusListItem[]; loading?: boolean; canManage?: boolean }>()
const emit = defineEmits<{ delete: [syllabus: SyllabusListItem] }>()

const columns = computed<TableColumn[]>(() => [
  { key: 'id', label: t('syllabuses.table.id'), hideOnMobile: true },
  { key: 'name', label: t('syllabuses.table.name'), primary: true },
  { key: 'subject', label: t('syllabuses.table.subject') },
  { key: 'topicsCount', label: t('syllabuses.topicsShort') },
  { key: 'createdAt', label: t('syllabuses.createdAtShort') },
])
</script>
