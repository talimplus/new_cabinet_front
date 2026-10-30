<template>
  <UiModal :model-value="modelValue" :title="t('students.dialog.reasonTitle')" size="sm" @update:model-value="emit('update:modelValue', $event)">
    <div class="space-y-4">
      <UiSelect
        :model-value="likelihood"
        :options="options"
        :label="t('students.dialog.returnTitle')"
        :searchable="false"
        @update:model-value="likelihood = ($event as ReturnLikelihood | null)"
      />
      <UiDatepicker
        v-if="isStop"
        v-model="stopDate"
        :enable-time="false"
        :clearable="false"
        :max-date="new Date()"
        :min-date="branding.openedOn"
        :label="t('students.dialog.stopDate')"
        :hint="t('students.dialog.stopDateHint')"
      />
      <UiTextarea v-model="comment" :label="t('students.dialog.comment')" :rows="3" />
    </div>
    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton @click="onConfirm">{{ t('common.confirm') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiSelect, UiTextarea, UiButton, UiDatepicker } from '@/shared/components'
import { useBrandingStore } from '@/stores/branding.store'
import { toDateString } from '@/shared/utils/format-date'
import { StudentStatus } from '../enums/student-status.enum'
import type { StudentStatusChangeForm } from '../interfaces/student-start.interface'
import { ReturnLikelihood, RETURN_LIKELIHOOD_LABEL_KEYS } from '../enums/return-likelihood.enum'

const { t } = useI18n()

/** `status` — STOPPED also asks the day the student stopped (may be past). */
const props = defineProps<{ modelValue: boolean; status?: StudentStatus | null }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [payload: StudentStatusChangeForm]
}>()

const branding = useBrandingStore()
const isStop = computed(() => props.status === StudentStatus.STOPPED)
const stopDate = ref<Date | null>(new Date())

const likelihood = ref<ReturnLikelihood | null>(null)
const comment = ref('')
const options = computed(() =>
  Object.values(ReturnLikelihood).map((v) => ({ label: t(RETURN_LIKELIHOOD_LABEL_KEYS[v]), value: v })),
)

watch(() => props.modelValue, (open) => {
  if (open) { likelihood.value = null; comment.value = ''; stopDate.value = new Date() }
})

function onConfirm() {
  emit('confirm', {
    returnLikelihood: likelihood.value ?? undefined,
    comment: comment.value.trim() || undefined,
    // Today is the backend default — send only a real past date.
    stopDate: isStop.value && toDateString(stopDate.value) !== toDateString(new Date())
      ? toDateString(stopDate.value) : undefined,
  })
}
</script>
