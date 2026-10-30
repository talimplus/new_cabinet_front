<template>
  <UiModal :model-value="open" :title="t(isStart ? 'groups.start.title' : 'groups.start.editTitle')" size="lg" :close-on-overlay="!saving" @update:model-value="!$event && emit('close')">
    <div class="space-y-4">
      <UiDatepicker
        v-if="isStart"
        :model-value="date"
        :enable-time="false"
        :clearable="false"
        :max-date="today"
        :min-date="branding.openedOn"
        :label="t('groups.start.date')"
        :hint="t('groups.start.dateHint')"
        @update:model-value="emit('update:date', pick($event))"
      />
      <p v-else-if="preview" class="text-sm text-foreground">
        {{ t('groups.start.editText', { from: formatDate(preview.prevStartDate), to: formatDate(preview.startDate) }) }}
      </p>
      <p v-if="preview?.attendanceBefore" class="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
        {{ t('groups.start.attendanceBlock', { count: preview.attendanceBefore }) }}
      </p>
      <GroupStartCandidates
        v-if="preview?.candidates.length"
        :candidates="preview.candidates"
        :selected="selected"
        :disabled="loading || saving"
        @toggle="(id, on) => emit('toggle', id, on)"
      />
      <p v-if="preview?.rows.length" class="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
        {{ t('common.backdate.warning') }}
      </p>
      <BackdateImpact :preview="preview" :loading="loading" />
    </div>

    <template #footer>
      <UiButton variant="outline" :disabled="saving" @click="emit('close')">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="saving" :disabled="!canConfirm" data-test="start-confirm" @click="emit('confirm')">
        {{ preview?.rows.length ? t('common.backdate.confirm') : t('common.confirm') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiDatepicker, UiButton } from '@/shared/components'
import BackdateImpact from '@/shared/components/backdate/BackdateImpact.vue'
import GroupStartCandidates from './GroupStartCandidates.vue'
import { GroupStartMode } from '../enums/group-start-mode.enum'
import { formatDate } from '@/shared/utils/format-date'
import { useBrandingStore } from '@/stores/branding.store'
import type { GroupStartPreview } from '../interfaces/group-start.interface'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  mode: GroupStartMode
  date: Date | null
  preview: GroupStartPreview | null
  selected: number[]
  loading?: boolean
  saving?: boolean
  canConfirm?: boolean
}>()
const emit = defineEmits<{
  close: []
  'update:date': [Date | null]
  toggle: [studentId: number, on: boolean]
  confirm: []
}>()

/** Nor before the organization joined the system. */
const branding = useBrandingStore()
const isStart = computed(() => props.mode === GroupStartMode.START)
/** Lessons can't have started tomorrow — the backend rejects a future day. */
const today = new Date()
const pick = (v: Date | Date[] | null): Date | null => (Array.isArray(v) ? (v[0] ?? null) : v)
</script>
