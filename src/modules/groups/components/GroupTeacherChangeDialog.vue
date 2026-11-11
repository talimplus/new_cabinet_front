<template>
  <UiModal
    :model-value="c.state.open"
    :title="t('groups.teacherChange.title', { name: c.state.group?.name ?? '' })"
    size="md"
    :close-on-overlay="!c.saving.value"
    @update:model-value="c.state.open = $event"
  >
    <div class="space-y-4">
      <p class="text-sm text-muted-foreground">
        {{ t('groups.teacherChange.current', { name: currentName }) }}
      </p>
      <UiSelect
        v-model="c.state.teacherId"
        :options="c.teachers.value"
        :label="t('groups.teacherChange.newTeacher')"
        :error="c.errors.teacherId"
      />
      <UiDatepicker
        :model-value="c.state.date"
        :enable-time="false"
        :clearable="false"
        :max-date="new Date()"
        :min-date="parseDate(c.state.group?.startDate) ?? undefined"
        :label="t('groups.teacherChange.date')"
        :hint="t('groups.teacherChange.dateHint')"
        :error="c.errors.teacherEffectiveFrom"
        @update:model-value="c.state.date = Array.isArray($event) ? ($event[0] ?? null) : $event"
      />
      <GroupScheduleConflicts
        v-model:accepted="c.accepted.value"
        :checking="c.conflictCheck.checking.value"
        :messages="c.conflictCheck.messages.value"
        :free="c.conflictCheck.checked.value && !c.conflictCheck.conflicts.value.length"
      />
    </div>
    <template #footer>
      <UiButton variant="outline" :disabled="c.saving.value" @click="c.state.open = false">
        {{ t('common.cancel') }}
      </UiButton>
      <UiButton :loading="c.saving.value" :disabled="!c.canSubmit.value" @click="c.submit">
        {{ t('groups.teacherChange.confirm') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiSelect, UiDatepicker, UiButton } from '@/shared/components'
import GroupScheduleConflicts from './GroupScheduleConflicts.vue'
import { parseDate } from '@/shared/utils/format-date'
import { useGroupTeacherChange } from '../composables/use-group-teacher-change'
import type { Group } from '../interfaces/group.interface'

const { t } = useI18n()
const emit = defineEmits<{ done: [] }>()
const c = useGroupTeacherChange(() => emit('done'))

const currentName = computed(() => {
  const teacher = c.state.group?.teacher
  return (teacher && `${teacher.firstName ?? ''} ${teacher.lastName ?? ''}`.trim()) || '—'
})

defineExpose({ open: (group: Group) => c.open(group) })
</script>
