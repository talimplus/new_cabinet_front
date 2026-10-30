<template>
  <UiModal :model-value="open" :title="t(isActivate ? 'students.start.title' : 'students.start.joinTitle')" size="lg" :close-on-overlay="!saving" @update:model-value="!$event && emit('close')">
    <div class="space-y-4">
      <UiDatepicker
        v-if="isActivate"
        :model-value="date"
        :enable-time="false"
        :clearable="false"
        :max-date="today"
        :min-date="branding.openedOn"
        :label="t('students.start.date')"
        :hint="t('students.start.dateHint')"
        @update:model-value="emit('update:date', pick($event))"
      />
      <p v-else class="text-sm text-foreground">{{ t('students.start.joinText', { date: formatDate(toDateString(date)) }) }}</p>
      <template v-if="preview || loading">
        <p v-if="preview?.rows.length" class="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
          {{ t('common.backdate.warning') }}
        </p>
        <BackdateImpact :preview="preview" :loading="loading" />
      </template>
    </div>

    <template #footer>
      <UiButton variant="outline" :disabled="saving" @click="emit('close')">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="saving" :disabled="!canConfirm" data-test="student-start-confirm" @click="emit('confirm')">
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
import { StudentStartMode } from '../enums/student-start-mode.enum'
import { formatDate, toDateString } from '@/shared/utils/format-date'
import { useBrandingStore } from '@/stores/branding.store'
import type { StudentStartPreview } from '../interfaces/student-start.interface'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  mode: StudentStartMode
  date: Date | null
  preview: StudentStartPreview | null
  loading?: boolean
  saving?: boolean
  canConfirm?: boolean
}>()
const emit = defineEmits<{ close: []; 'update:date': [Date | null]; confirm: [] }>()

/** Nor before the organization joined the system. */
const branding = useBrandingStore()
const isActivate = computed(() => props.mode === StudentStartMode.ACTIVATE)
/** A student can't have started tomorrow — the backend rejects a future day. */
const today = new Date()
const pick = (v: Date | Date[] | null): Date | null => (Array.isArray(v) ? (v[0] ?? null) : v)
</script>
