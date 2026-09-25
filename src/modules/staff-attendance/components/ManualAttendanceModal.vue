<template>
  <UiModal
    :model-value="state.open"
    :title="t('staffAttendance.manual.title')"
    size="sm"
    :close-on-overlay="!state.saving"
    @update:model-value="emit('close')"
  >
    <div class="space-y-4">
      <UiSelect
        :model-value="state.userId"
        :options="employees"
        :label="t('staffAttendance.manual.staff')"
        :disabled="state.saving"
        @update:model-value="state.userId = typeof $event === 'number' ? $event : null"
      />
      <div class="grid gap-4 sm:grid-cols-2">
        <UiInput v-model="state.workDate" type="date" :label="t('staffAttendance.manual.date')" :disabled="state.saving" />
        <UiInput v-model="state.checkInTime" type="time" :label="t('staffAttendance.manual.time')" :disabled="state.saving" />
      </div>
      <UiTextarea v-model="state.note" :label="t('staffAttendance.manual.note')" :rows="2" :disabled="state.saving" />
      <p class="rounded-md bg-info-soft px-3 py-2 text-xs text-info">{{ t('staffAttendance.manual.hint') }}</p>
    </div>

    <template #footer>
      <UiButton variant="ghost" :disabled="state.saving" @click="emit('close')">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="state.saving" :disabled="!state.userId" @click="emit('submit')">{{ t('common.save') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiModal, UiSelect, UiInput, UiTextarea, UiButton } from '@/shared/components'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const { t } = useI18n()

interface ManualState {
  open: boolean
  userId: number | null
  workDate: string
  checkInTime: string
  note: string
  saving: boolean
}
defineProps<{ state: ManualState; employees: SelectOption[] }>()
const emit = defineEmits<{ close: []; submit: [] }>()
</script>
