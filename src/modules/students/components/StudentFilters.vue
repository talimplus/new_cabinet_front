<template>
  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <UiSelect
      v-if="showSubject"
      :model-value="subjectId"
      :options="subjectOptions"
      :placeholder="t('students.filter.subject')"
      @update:model-value="update('subjectId', toNum($event))"
    />
    <UiSelect
      v-if="showPreferredTime"
      :model-value="preferredTime"
      :options="timeOptions"
      :searchable="false"
      :placeholder="t('students.filter.preferredTime')"
      @update:model-value="update('preferredTime', $event)"
    />
    <UiSelect
      v-if="showPreferredDays"
      :model-value="preferredDays"
      :options="dayOptions"
      mode="multiple"
      :placeholder="t('students.filter.preferredDays')"
      @update:model-value="update('preferredDays', $event)"
    />
    <UiSelect
      v-if="showReturnLikelihood"
      :model-value="returnLikelihood"
      :options="likelihoodOptions"
      :searchable="false"
      :placeholder="t('students.filter.returnLikelihood')"
      @update:model-value="update('returnLikelihood', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UiSelect } from '@/shared/components'
import { StudentPreferredTime, PREFERRED_TIME_LABEL_KEYS } from '../enums/student-preferred-time.enum'
import { ReturnLikelihood, RETURN_LIKELIHOOD_LABEL_KEYS } from '../enums/return-likelihood.enum'
import { WeekDay, WEEK_DAY_LABEL_KEYS } from '@/modules/groups/enums/week-day.enum'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  subjectOptions: SelectOption[]
  showSubject?: boolean
  showPreferredTime?: boolean
  showPreferredDays?: boolean
  showReturnLikelihood?: boolean
}>()

const subjectId = defineModel<number | null>('subjectId', { default: null })
const preferredTime = defineModel<StudentPreferredTime | null>('preferredTime', { default: null })
const preferredDays = defineModel<WeekDay[]>('preferredDays', { default: () => [] })
const returnLikelihood = defineModel<ReturnLikelihood | null>('returnLikelihood', { default: null })
const emit = defineEmits<{ change: [] }>()

const timeOptions = computed(() =>
  Object.values(StudentPreferredTime).map((v) => ({ label: t(PREFERRED_TIME_LABEL_KEYS[v]), value: v })),
)
const dayOptions = computed(() =>
  Object.values(WeekDay).map((v) => ({ label: t(WEEK_DAY_LABEL_KEYS[v]), value: v })),
)
const likelihoodOptions = computed(() =>
  Object.values(ReturnLikelihood).map((v) => ({ label: t(RETURN_LIKELIHOOD_LABEL_KEYS[v]), value: v })),
)

const toNum = (v: unknown): number | null => (typeof v === 'number' ? v : null)

const models = { subjectId, preferredTime, preferredDays, returnLikelihood }
function update(key: keyof typeof models, value: unknown) {
  ;(models[key].value as unknown) = value
  emit('change')
}
</script>
