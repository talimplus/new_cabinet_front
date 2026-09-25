<template>
  <UiModal :model-value="modelValue" :title="t('groups.attendance.title')" size="sm" @update:model-value="emit('update:modelValue', $event)">
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="s in statuses"
          :key="s"
          type="button"
          :class="cn(
            'flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
            s === status ? 'border-primary bg-primary-soft text-primary' : 'border-border text-foreground hover:bg-surface-muted',
          )"
          @click="emit('update:status', s)"
        >
          <UiIcon :icon="icons[s]" :size="18" :class="colors[s]" />
          {{ t(labelKeys[s]) }}
        </button>
      </div>

      <UiTextarea
        :model-value="comment"
        :label="t('groups.attendance.comment')"
        :rows="2"
        :placeholder="status === AttendanceStatus.EXCUSED ? t('groups.attendance.excusedReasonPlaceholder') : ''"
        @update:model-value="emit('update:comment', $event)"
      />
    </div>

    <template #footer>
      <UiButton variant="ghost" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="saving" @click="emit('save')">{{ t('common.save') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { cn } from '@/shared/utils/cn'
import { useI18n } from 'vue-i18n'
import { UiModal, UiTextarea, UiButton, UiIcon } from '@/shared/components'
import {
  AttendanceStatus,
  ATTENDANCE_STATUS_LABEL_KEYS,
  ATTENDANCE_STATUS_ICONS,
  ATTENDANCE_STATUS_COLORS,
} from '../../enums/attendance-status.enum'

const { t } = useI18n()

defineProps<{
  modelValue: boolean
  status: AttendanceStatus
  comment: string
  saving?: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:status': [value: AttendanceStatus]
  'update:comment': [value: string]
  save: []
}>()

const statuses = Object.values(AttendanceStatus)
const labelKeys = ATTENDANCE_STATUS_LABEL_KEYS
const icons = ATTENDANCE_STATUS_ICONS
const colors = ATTENDANCE_STATUS_COLORS
</script>
