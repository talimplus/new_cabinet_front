<template>
  <UiModal :model-value="state.open" :title="t('holidays.addTitle')" size="sm" :close-on-overlay="!state.saving" @update:model-value="emit('close')">
    <div class="space-y-4">
      <UiInput :model-value="state.name" :label="t('holidays.form.name')" :placeholder="t('holidays.form.namePlaceholder')" :error="state.errors.name" @update:model-value="emit('change', { name: String($event ?? '') })" />
      <div class="grid gap-4 sm:grid-cols-2">
        <UiDatepicker :model-value="state.fromDate" :enable-time="false" :label="t('holidays.form.fromDate')" :error="state.errors.fromDate" @update:model-value="emit('change', { fromDate: pick($event) })" />
        <UiDatepicker :model-value="state.toDate" :enable-time="false" :label="t('holidays.form.toDate')" :error="state.errors.toDate" @update:model-value="emit('change', { toDate: pick($event) })" />
      </div>
      <UiCheckbox
        v-if="canScopeToCenter"
        :model-value="state.onlyActiveCenter"
        :label="t('holidays.form.onlyCenter', { center: activeCenterName })"
        @update:model-value="emit('change', { onlyActiveCenter: $event })"
      />
      <p class="rounded-md bg-info-soft px-3 py-2 text-xs text-info">{{ t('holidays.form.hint') }}</p>
    </div>
    <template #footer>
      <UiButton variant="ghost" :disabled="state.saving" @click="emit('close')">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="state.saving" @click="emit('submit')">{{ t('common.save') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiModal, UiInput, UiDatepicker, UiCheckbox, UiButton } from '@/shared/components'
import type { HolidayFormState } from '../composables/use-holidays'

const { t } = useI18n()
defineProps<{ state: HolidayFormState; canScopeToCenter: boolean; activeCenterName: string }>()
const emit = defineEmits<{
  close: []
  submit: []
  change: [patch: Partial<Pick<HolidayFormState, 'fromDate' | 'toDate' | 'name' | 'onlyActiveCenter'>>]
}>()

const pick = (v: Date | Date[] | null): Date | null => (Array.isArray(v) ? (v[0] ?? null) : v)
</script>
