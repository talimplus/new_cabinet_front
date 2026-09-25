<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <UiSelect :model-value="form.preferredTime" :options="timeOptions" :label="t('leads.form.preferredTime')" :searchable="false" @update:model-value="form.preferredTime = ($event as StudentPreferredTime | null)" />
    <UiSelect :model-value="form.preferredDays" :options="dayOptions" mode="multiple" :label="t('leads.form.preferredDays')" @update:model-value="form.preferredDays = ($event as WeekDay[])" />
    <UiSelect :model-value="form.groupIds" :options="groups" mode="multiple" :label="t('leads.form.groups')" :disabled="!form.centerId" @update:model-value="form.groupIds = ($event as number[])" />
    <UiInput v-model="form.heardAboutUs" :label="t('leads.form.heardAboutUs')" />
  </div>
</template>

<script setup lang="ts">
import { UiSelect, UiInput } from '@/shared/components'
import { StudentPreferredTime, PREFERRED_TIME_LABEL_KEYS } from '@/modules/students/enums/student-preferred-time.enum'
import { WeekDay, WEEK_DAY_LABEL_KEYS } from '@/modules/groups/enums/week-day.enum'
import type { LeadFormState } from '../composables/use-lead-form'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  form: LeadFormState
  errors: Record<string, string>
  groups: SelectOption[]
}>()

const timeOptions = computed(() =>
  Object.values(StudentPreferredTime).map((v) => ({ label: t(PREFERRED_TIME_LABEL_KEYS[v]), value: v })),
)
const dayOptions = computed(() =>
  Object.values(WeekDay).map((v) => ({ label: t(WEEK_DAY_LABEL_KEYS[v]), value: v })),
)
const toNum = (v: unknown): number | null => (typeof v === 'number' ? v : null)
</script>
