<template>
  <UiModal
    :model-value="modelValue"
    :title="editing ? t('groups.form.editTitle') : t('groups.form.createTitle')"
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <UiInput v-model="form.name" :label="t('groups.form.name')" :error="errors.name" required />
      <div class="grid gap-4 sm:grid-cols-2">
        <UiSelect :model-value="form.subjectId" :options="subjects" :label="t('groups.form.subject')" :error="errors.subjectId" :disabled="!form.centerId" @update:model-value="setSelect('subjectId', $event)" />
        <UiSelect :model-value="form.roomId" :options="rooms" :label="t('groups.form.room')" :error="errors.roomId" :disabled="!form.centerId" @update:model-value="setSelect('roomId', $event)" />
        <UiSelect :model-value="form.teacherId" :options="teachers" :label="t('groups.form.teacher')" :error="errors.teacherId" :disabled="!form.centerId" @update:model-value="setSelect('teacherId', $event)" />
        <UiInput v-model="form.monthlyFee" type="number" :label="t('groups.form.monthlyFee')" :error="errors.monthlyFee" />
        <UiInput v-model="form.lessonDurationMinutes" type="number" :label="t('groups.form.lessonDuration')" :hint="t('groups.form.minutesShort')" />
        <UiDatepicker :model-value="form.endDate" :enable-time="false" :label="t('groups.form.endDate')" :hint="t('groups.form.endDateHint')" :error="errors.endDate" @update:model-value="form.endDate = Array.isArray($event) ? ($event[0] ?? null) : $event" />
      </div>
      <p v-if="!form.endDate" class="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
        <strong>{{ t('groups.noEndDate') }}</strong> — {{ t('groups.noEndDateHint') }}
      </p>
      <GroupFeeHint :fee-changed="feeChanged" :apply-fee-now="form.applyFeeNow" :current-fee="currentFee" :next-month-label="nextMonthLabel" @update:apply-fee-now="form.applyFeeNow = $event" />
      <GroupScheduleEditor v-model:days="days" v-model:all-time="allTime" v-model:times="times" v-model:different-time="differentTime" :day-options="dayOptions" />
      <GroupScheduleConflicts :checking="conflictChecking" :messages="conflictMessages" :free="conflictChecked && !conflicts.length" />
    </div>

    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="loading" :disabled="conflicts.length > 0" @click="onSave">{{ t('common.save') }}</UiButton>
    </template>
  </UiModal>

  <UiConfirmDialog
    v-model="shortenOpen"
    :title="t('groups.form.shortenTitle')"
    :message="t('groups.form.shortenText')"
    :confirm-label="t('groups.form.confirm')"
    :loading="loading"
    @confirm="doSubmit"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiInput, UiSelect, UiDatepicker, UiButton, UiConfirmDialog } from '@/shared/components'
import GroupScheduleEditor from './GroupScheduleEditor.vue'
import GroupFeeHint from './GroupFeeHint.vue'
import GroupScheduleConflicts from './GroupScheduleConflicts.vue'
import { useGroupForm } from '../composables/use-group-form'
import type { Group } from '../interfaces/group.interface'
import type { GroupForm } from '../interfaces/group-form.interface'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  editing: Group | null
  defaultCenterId: number | null
  /** Field errors from a status-change 422, shown under endDate/roomId on open. */
  statusErrors?: Record<string, string> | null
  loading?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; submit: [payload: GroupForm] }>()

const {
  form, errors, days, allTime, times, differentTime, dayOptions,
  subjects, rooms, teachers, feeChanged, isShortening, nextMonthLabel, currentFee,
  conflicts, conflictChecking, conflictChecked, conflictMessages,
  reset, validate, toPayload, setBackendErrors, setFieldErrors, setSelect,
} = useGroupForm(() => props.defaultCenterId, () => props.modelValue)

const shortenOpen = ref(false)
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    reset(props.editing)
    if (props.statusErrors) setFieldErrors(props.statusErrors)
  },
)

function onSave() {
  if (conflicts.value.length || !validate()) return
  if (isShortening.value) shortenOpen.value = true
  else doSubmit()
}
function doSubmit() {
  shortenOpen.value = false
  emit('submit', toPayload())
}
defineExpose({ setBackendErrors })
</script>
