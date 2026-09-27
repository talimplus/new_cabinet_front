<template>
  <UiModal
    :model-value="state.open"
    :title="t('groups.pauses.addTitle')"
    size="sm"
    :close-on-overlay="!state.saving"
    @update:model-value="emit('close')"
  >
    <div class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <UiDatepicker
          :model-value="state.fromDate"
          :enable-time="false"
          :label="t('groups.pauses.fromDate')"
          :error="state.errors.fromDate"
          @update:model-value="emit('change', { fromDate: pick($event) })"
        />
        <UiDatepicker
          :model-value="state.toDate"
          :enable-time="false"
          :label="t('groups.pauses.toDate')"
          :error="state.errors.toDate"
          @update:model-value="emit('change', { toDate: pick($event) })"
        />
      </div>
      <UiTextarea :model-value="state.reason" :label="t('groups.pauses.reason')" :error="state.errors.reason" :rows="2" @update:model-value="emit('change', { reason: String($event ?? '') })" />
      <p class="rounded-md bg-info-soft px-3 py-2 text-xs text-info">{{ t('groups.pauses.hint') }}</p>
    </div>
    <template #footer>
      <UiButton variant="ghost" :disabled="state.saving" @click="emit('close')">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="state.saving" @click="emit('submit')">{{ t('common.save') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiModal, UiDatepicker, UiTextarea, UiButton } from '@/shared/components'
import type { PauseFormState } from '../../composables/use-group-pauses'

const { t } = useI18n()
defineProps<{ state: PauseFormState }>()
const emit = defineEmits<{
  submit: []
  close: []
  change: [patch: Partial<Pick<PauseFormState, 'fromDate' | 'toDate' | 'reason'>>]
}>()

const pick = (v: Date | Date[] | null): Date | null => (Array.isArray(v) ? (v[0] ?? null) : v)
</script>
