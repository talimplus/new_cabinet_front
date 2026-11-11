<template>
  <UiModal
    :model-value="r.state.open"
    :title="t('students.reactivate.title', { name: r.state.name })"
    size="md"
    :close-on-overlay="!r.saving.value"
    @update:model-value="r.state.open = $event"
  >
    <UiSpinner v-if="r.loading.value" class="mx-auto" />
    <div v-else-if="r.info.value" class="space-y-4">
      <p class="text-sm text-muted-foreground">{{ t('students.reactivate.hint') }}</p>
      <UiDatepicker
        :model-value="r.state.date"
        :enable-time="false"
        :clearable="false"
        :min-date="r.minDate.value"
        :max-date="r.maxDate.value"
        :label="t('students.reactivate.date')"
        :hint="t('students.reactivate.dateHint')"
        :error="r.error.value"
        @update:model-value="r.state.date = Array.isArray($event) ? ($event[0] ?? null) : $event"
      />
      <p v-if="r.continuing.value.length" class="text-sm text-foreground">
        {{ t('students.reactivate.groups', { names: r.continuing.value.map((g) => g.name).join(', ') }) }}
      </p>
      <p v-else class="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
        {{ t('students.reactivate.noGroups') }}
      </p>
      <UiSelect
        v-model="r.state.groupId"
        :options="r.groupOptions.value"
        :label="t(r.needsGroup.value ? 'students.reactivate.group' : 'students.reactivate.extraGroup')"
        :error="r.groupError.value"
        clearable
      />
    </div>
    <template #footer>
      <UiButton variant="outline" :disabled="r.saving.value" @click="r.state.open = false">
        {{ t('common.cancel') }}
      </UiButton>
      <UiButton :loading="r.saving.value" :disabled="!r.canSubmit.value" @click="r.submit">
        {{ t('students.reactivate.confirm') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiModal, UiDatepicker, UiButton, UiSpinner, UiSelect } from '@/shared/components'
import { useStudentReactivate } from '../../composables/use-student-reactivate'

const { t } = useI18n()
const emit = defineEmits<{ done: [] }>()
const r = useStudentReactivate(() => emit('done'))

defineExpose({ open: (studentId: number, name: string, centerId?: number) => r.open(studentId, name, centerId) })
</script>
