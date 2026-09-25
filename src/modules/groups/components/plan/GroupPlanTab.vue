<template>
  <div>
    <div v-if="loading" class="flex justify-center py-12 text-primary">
      <UiSpinner :size="28" />
    </div>

    <PlanEmptyState
      v-else-if="plan && !plan.syllabus"
      v-model="selectedSyllabusId"
      :options="syllabusOptions"
      :loading="loadingSyllabuses"
      :attaching="attaching"
      :can-edit="canEdit"
      @attach="attachSyllabus"
    />

    <template v-else-if="plan && plan.syllabus">
      <PlanHeader
        :syllabus-name="plan.syllabus.name"
        :total-lessons="plan.totalLessons"
        :horizon-date="plan.horizonDate"
        :can-edit="canEdit"
        @distribute="openDistribute"
        @replace="openReplace"
        @detach="detachSyllabus"
      />

      <div class="mt-4 flex flex-col gap-2">
        <PlanLessonRow
          v-for="lesson in plan.lessons"
          :key="lesson.lessonNumber"
          :lesson="lesson"
          :syllabus-topics="plan.syllabus.topics"
          :selected-ids="lessonSelections[lesson.lessonNumber] ?? []"
          :saving="savingLesson === lesson.lessonNumber"
          :dirty="isLessonDirty(lesson.lessonNumber)"
          :can-edit="canEdit"
          @toggle="(p) => toggleTopic(lesson.lessonNumber, p.topicId, p.checked)"
          @save="saveLessonTopics(lesson.lessonNumber)"
        />
      </div>
    </template>
    <DistributeDialog
      v-model="distribute.open"
      v-model:total-lessons="distribute.totalLessons"
      v-model:instructions="distribute.instructions"
      :loading="distribute.loading"
      @confirm="runDistribute"
    />
    <ReplaceSyllabusDialog
      v-model="replaceOpen"
      :options="syllabusOptions"
      :loading="loadingSyllabuses"
      :saving="attaching"
      @confirm="onReplace"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { UiSpinner } from '@/shared/components'
import PlanEmptyState from './PlanEmptyState.vue'
import PlanHeader from './PlanHeader.vue'
import PlanLessonRow from './PlanLessonRow.vue'
import DistributeDialog from './DistributeDialog.vue'
import ReplaceSyllabusDialog from './ReplaceSyllabusDialog.vue'
import { useGroupPlan } from '../../composables/use-group-plan'

interface Props {
  groupId: number
  centerId?: number
  canEdit?: boolean
  subjectId?: number
}
const props = withDefaults(defineProps<Props>(), { canEdit: false })

const {
  plan, loading, syllabusOptions, loadingSyllabuses, selectedSyllabusId,
  attaching, lessonSelections, savingLesson, distribute,
  init, loadSyllabuses, attachSyllabus, replaceSyllabus, detachSyllabus,
  toggleTopic, isLessonDirty, saveLessonTopics, openDistribute, runDistribute,
} = useGroupPlan(props.groupId, {
  getCenterId: () => props.centerId,
  getSubjectId: () => props.subjectId,
})

const replaceOpen = ref(false)
function openReplace(): void {
  replaceOpen.value = true
  if (!syllabusOptions.value.length) loadSyllabuses()
}
async function onReplace(id: number): Promise<void> {
  await replaceSyllabus(id)
  replaceOpen.value = false
}

onMounted(init)
</script>
