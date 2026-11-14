<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <UiSelect name="position" :label="t('candidates.form.position')" :options="positions" :searchable="false" :placeholder="t('candidates.form.positionPlaceholder')" required />
    <!-- Only a teacher / assistant has a subject; admin, manager … do not. -->
    <UiSelect
      v-if="withSubject"
      name="subjectId"
      :label="t('candidates.form.subject')"
      :options="subjects"
      :placeholder="t('candidates.form.subjectPlaceholder')"
      :required="position === CandidatePosition.TEACHER"
      clearable
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFieldValue } from 'vee-validate'
import { UiSelect } from '@/shared/components'
import {
  CandidatePosition, CANDIDATE_POSITION_LABEL_KEYS, POSITIONS_WITH_SUBJECT,
} from '../enums/candidate-position.enum'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const { t } = useI18n()
defineProps<{ subjects: SelectOption[] }>()

/** Must sit inside the candidate `UiForm` — it reads the picked position from it. */
const position = useFieldValue<CandidatePosition | undefined>('position')
const withSubject = computed(() => !!position.value && POSITIONS_WITH_SUBJECT.includes(position.value))
const positions = computed<SelectOption[]>(() =>
  Object.values(CandidatePosition).map((p) => ({ label: t(CANDIDATE_POSITION_LABEL_KEYS[p]), value: p })),
)
</script>
