<template>
  <UiModal
    :model-value="state.open"
    :title="t('groups.leave.title', { name })"
    size="sm"
    :close-on-overlay="!state.saving"
    @update:model-value="state.open = $event"
  >
    <div class="space-y-4">
      <p class="text-sm text-muted-foreground">{{ t('groups.leave.hint', { group: groupName }) }}</p>
      <UiDatepicker
        v-model="state.stopDate"
        :enable-time="false"
        :clearable="false"
        :max-date="new Date()"
        :min-date="branding.openedOn"
        :label="t('groups.leave.date')"
        :hint="t('groups.leave.dateHint')"
        :error="state.errors.stopDate"
      />
      <template v-if="state.isLastGroup">
        <p class="text-sm text-warning">{{ t('groups.leave.lastGroup') }}</p>
        <UiSelect
          :model-value="state.likelihood"
          :options="likelihoods"
          :label="t('students.dialog.returnTitle')"
          :searchable="false"
          :error="state.errors.returnLikelihood"
          @update:model-value="state.likelihood = ($event as ReturnLikelihood | null)"
        />
      </template>
      <UiTextarea v-model="state.reason" :label="t('students.dialog.comment')" :rows="2" />
    </div>
    <template #footer>
      <UiButton variant="ghost" :disabled="state.saving" @click="state.open = false">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="state.saving" :disabled="!canSubmit" @click="submit">{{ t('groups.leave.confirm') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiDatepicker, UiModal, UiSelect, UiTextarea } from '@/shared/components'
import { useBrandingStore } from '@/stores/branding.store'
import { ReturnLikelihood, RETURN_LIKELIHOOD_LABEL_KEYS } from '@/modules/students/enums/return-likelihood.enum'
import { useGroupStudentLeave } from '../../composables/use-group-student-leave'
import type { Student } from '@/modules/students/interfaces/student.interface'

const { t } = useI18n()
const branding = useBrandingStore()

const props = defineProps<{ groupId: number; groupName: string }>()
const emit = defineEmits<{ done: [] }>()

const { state, open, submit } = useGroupStudentLeave(props.groupId, () => emit('done'))
defineExpose({ open: (student: Student) => open(student) })

const name = computed(() => (state.student ? `${state.student.lastName} ${state.student.firstName}` : ''))
const likelihoods = computed(() =>
  Object.values(ReturnLikelihood).map((v) => ({ label: t(RETURN_LIKELIHOOD_LABEL_KEYS[v]), value: v })),
)
const canSubmit = computed(
  () => !!state.stopDate && !state.checking && (!state.isLastGroup || !!state.likelihood),
)
</script>
