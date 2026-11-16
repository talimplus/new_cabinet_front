<template>
  <section class="space-y-3">
    <div>
      <h3 class="text-base font-semibold text-foreground">{{ t('teacherDashboard.list.title') }}</h3>
      <p class="text-xs text-muted-foreground">{{ t('teacherDashboard.list.hint') }}</p>
    </div>
    <TeacherStudentsToolbar
      :filters="filters"
      :tabs="list.tabs.value"
      :group-options="list.groupOptions.value"
      @change="emit('change', $event)"
    />

    <p v-if="!hasGroups" class="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
      {{ t('teacherDashboard.list.noGroups') }}
    </p>
    <p v-else-if="!list.panels.value.length" class="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
      {{ t('teacherDashboard.list.nothingFound') }}
    </p>
    <div v-else class="space-y-2">
      <TeacherGroupPanel
        v-for="p in list.panels.value"
        :key="p.group.id"
        :panel="p"
        :open="list.isOpen(p.group.id)"
        :can-open-group="canOpenGroup"
        :can-open-student="canOpenStudent"
        @update:open="list.setOpen(p.group.id, $event)"
        @open-group="emit('open-group', $event)"
        @open-student="emit('open-student', $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import TeacherStudentsToolbar from './TeacherStudentsToolbar.vue'
import TeacherGroupPanel from './TeacherGroupPanel.vue'
import type { useGroupStudents } from '../composables/use-group-students'
import type { GroupStudentsFilters } from '../interfaces/group-panel.interface'

const { t } = useI18n()
defineProps<{
  filters: GroupStudentsFilters
  list: ReturnType<typeof useGroupStudents>
  hasGroups: boolean
  canOpenGroup?: boolean
  canOpenStudent?: boolean
}>()
const emit = defineEmits<{
  change: [patch: Partial<GroupStudentsFilters>]
  'open-group': [id: number]
  'open-student': [id: number]
}>()
</script>
