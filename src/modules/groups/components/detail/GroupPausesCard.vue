<template>
  <section class="rounded-lg border border-border bg-surface p-4 shadow-card">
    <div class="mb-3 flex items-center gap-2">
      <h3 class="text-sm font-semibold text-foreground">{{ t('groups.pauses.title') }}</h3>
      <UiButton v-if="canEdit" size="sm" variant="outline" class="ml-auto" @click="openForm">
        <UiIcon :icon="Pause" :size="14" />{{ t('groups.pauses.add') }}
      </UiButton>
    </div>
    <p class="mb-3 text-xs text-muted-foreground">{{ t('groups.pauses.description') }}</p>

    <ul v-if="pauses.length" class="divide-y divide-border">
      <li v-for="p in pauses" :key="p.id" class="flex items-center gap-3 py-2 text-sm">
        <div class="min-w-0 flex-1">
          <p class="font-mono font-medium">{{ formatDate(p.fromDate) }} – {{ formatDate(p.toDate) }}</p>
          <p class="truncate text-xs text-muted-foreground">{{ p.reason }}</p>
        </div>
        <UiIconButton v-if="canEdit" :icon="Trash2" tone="danger" :label="t('common.delete')" @click="pendingDelete = p" />
      </li>
    </ul>
    <p v-else-if="!loading" class="text-sm text-muted-foreground">{{ t('groups.pauses.empty') }}</p>

    <GroupPauseModal :state="form" @submit="submit" @close="closeForm" @change="setField" />
    <UiConfirmDialog
      :model-value="!!pendingDelete"
      :title="t('groups.pauses.deleteTitle')"
      :message="t('groups.pauses.deleteText')"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiIcon, UiIconButton, UiConfirmDialog } from '@/shared/components'
import { Pause, Trash2 } from '@/shared/icons'
import { formatDate } from '@/shared/utils/format-date'
import GroupPauseModal from './GroupPauseModal.vue'
import { useGroupPauses } from '../../composables/use-group-pauses'

const { t } = useI18n()
const props = defineProps<{ groupId: number; canEdit: boolean }>()
const { pauses, loading, form, pendingDelete, deleting, load, openForm, setField, closeForm, submit, confirmDelete } =
  useGroupPauses(props.groupId)
onMounted(load)
</script>
