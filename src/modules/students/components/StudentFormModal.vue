<template>
  <UiModal
    :model-value="modelValue"
    :title="editing ? t('students.form.editTitle') : t('students.form.createTitle')"
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <div class="grid gap-3 sm:grid-cols-2">
        <UiInput v-model="form.lastName" :label="t('students.form.lastName')" :error="errors.lastName" required />
        <UiInput v-model="form.firstName" :label="t('students.form.firstName')" :error="errors.firstName" required />
        <UiInput v-model="form.phone" type="tel" :label="t('students.form.phone')" :error="errors.phone" required />
        <UiInput v-model="form.secondPhone" type="tel" :label="t('students.form.secondPhone')" :error="errors.secondPhone" />
        <UiDatepicker v-model="form.birthDate" :label="t('students.form.birthDate')" :error="errors.birthDate" />
        <UiInput v-model="form.monthlyFee" type="number" :label="t('students.form.monthlyFee')" :error="errors.monthlyFee" />
        <UiSelect :model-value="form.preferredTime" :options="timeOptions" :label="t('students.form.preferredTime')" :searchable="false" @update:model-value="form.preferredTime = ($event as StudentPreferredTime | null)" />
        <UiSelect :model-value="form.preferredDays" :options="dayOptions" mode="multiple" :label="t('students.form.preferredDays')" @update:model-value="form.preferredDays = ($event as WeekDay[])" />
        <UiSelect :model-value="form.subjectId" :options="subjects" :label="t('students.form.subject')" :disabled="!form.centerId" @update:model-value="form.subjectId = toNum($event)" />
        <UiSelect :model-value="form.groupIds" :options="groups" mode="multiple" :label="t('students.form.groups')" :disabled="!form.centerId" @update:model-value="form.groupIds = ($event as number[])" />
        <UiSelect :model-value="form.referrerId" :options="referrers" :label="t('students.form.referrer')" :disabled="!form.centerId" @update:model-value="form.referrerId = toNum($event)" />
        <UiInput v-model="form.heardAboutUs" :label="t('students.form.heardAboutUs')" />
      </div>
      <UiTextarea v-model="form.comment" :label="t('students.form.comment')" :rows="2" />
      <StudentIdentityFields v-model:passport-series="form.passportSeries" v-model:passport-number="form.passportNumber" v-model:jshshir="form.jshshir" />
      <StudentDiscountSection v-model:use-periods="form.usePeriods" v-model:type="form.discountType" v-model:value="form.discountValue" v-model:reason="form.discountReason" v-model:periods="form.discountPeriods" :group-options="selectedGroups" />
    </div>

    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="loading" @click="onSave">{{ t('common.save') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiInput, UiSelect, UiDatepicker, UiTextarea, UiButton } from '@/shared/components'
import StudentIdentityFields from './StudentIdentityFields.vue'
import StudentDiscountSection from './StudentDiscountSection.vue'
import { useStudentForm } from '../composables/use-student-form'
import { StudentPreferredTime, PREFERRED_TIME_LABEL_KEYS } from '../enums/student-preferred-time.enum'
import { WeekDay, WEEK_DAY_LABEL_KEYS } from '@/modules/groups/enums/week-day.enum'
import type { Student } from '../interfaces/student.interface'
import type { StudentForm } from '../interfaces/student-form.interface'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  editing: Student | null
  defaultCenterId: number | null
  loading?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; submit: [payload: StudentForm] }>()

const { form, errors, subjects, groups, referrers, reset, validate, toPayload, setBackendErrors } =
  useStudentForm(() => props.defaultCenterId)

const timeOptions = computed(() =>
  Object.values(StudentPreferredTime).map((v) => ({ label: t(PREFERRED_TIME_LABEL_KEYS[v]), value: v })),
)
const dayOptions = computed(() =>
  Object.values(WeekDay).map((v) => ({ label: t(WEEK_DAY_LABEL_KEYS[v]), value: v })),
)

const toNum = (v: unknown): number | null => (typeof v === 'number' ? v : null)
// A discount period can be limited to one of the groups picked above (e.g. the cheaper subject).
const selectedGroups = computed(() => groups.value.filter((g) => form.groupIds.includes(g.value as number)))

watch(() => props.modelValue, (open) => { if (open) reset(props.editing) })

function onSave() {
  if (validate()) emit('submit', toPayload())
}
defineExpose({ setBackendErrors })
</script>
