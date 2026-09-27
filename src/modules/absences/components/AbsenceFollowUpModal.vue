<template>
  <UiModal
    :model-value="open"
    :title="t('absences.followUp.title')"
    size="sm"
    :close-on-overlay="!state.saving"
    @update:model-value="emit('close')"
  >
    <div v-if="state.row" class="space-y-4">
      <div class="rounded-md bg-surface-muted px-3 py-2 text-sm">
        <p class="font-semibold text-foreground">{{ state.row.student.firstName }} {{ state.row.student.lastName }}</p>
        <p class="text-xs text-muted-foreground">
          {{ state.row.group.name }} · <span class="font-mono">{{ formatDate(state.row.lessonDate) }}</span>
        </p>
        <p v-if="state.row.comment" class="mt-1 text-xs text-muted-foreground">
          {{ t('absences.table.teacherNote') }}: {{ state.row.comment }}
        </p>
      </div>
      <UiTextarea
        :model-value="state.note"
        :label="t('absences.followUp.note')"
        :placeholder="t('absences.followUp.placeholder')"
        :rows="3"
        :disabled="state.saving"
        @update:model-value="emit('update:note', String($event ?? ''))"
      />
      <p class="text-xs text-muted-foreground">{{ t('absences.followUp.hint') }}</p>
    </div>

    <template #footer>
      <UiButton variant="ghost" :disabled="state.saving" @click="emit('close')">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="state.saving" @click="emit('submit')">{{ t('common.save') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiModal, UiTextarea, UiButton } from '@/shared/components'
import { formatDate } from '@/shared/utils/format-date'
import type { FollowUpState } from '../composables/use-absences'

const { t } = useI18n()
defineProps<{ open: boolean; state: FollowUpState }>()
const emit = defineEmits<{ close: []; submit: []; 'update:note': [value: string] }>()
</script>
