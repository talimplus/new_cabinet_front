import { reactive, ref } from 'vue'
import {
  fetchGroupPlan,
  fetchSyllabuses,
  setGroupSyllabus,
  setLessonTopics,
  distributePlan,
} from '../api/group-plan.api'
import { useNotificationStore } from '@/stores/notification.store'
import type { GroupPlan } from '../interfaces/group-plan.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { t } from '@/locales'

interface GroupPlanOptions {
  getCenterId?: () => number | undefined
  getSubjectId?: () => number | undefined
}

interface DistributeState {
  open: boolean
  loading: boolean
  totalLessons: number | null
  instructions: string
}

/** All state + calls for the group Plan tab; keeps GroupPlanTab.vue thin. */
export function useGroupPlan(groupId: number, opts: GroupPlanOptions = {}) {
  const notify = useNotificationStore()

  const plan = ref<GroupPlan | null>(null)
  const loading = ref(false)

  const syllabusOptions = ref<SelectOption[]>([])
  const loadingSyllabuses = ref(false)
  const selectedSyllabusId = ref<number | null>(null)
  const attaching = ref(false)
  const detaching = ref(false)

  /** Working copy of each lesson's topic ids, keyed by lessonNumber. */
  const lessonSelections = reactive<Record<number, number[]>>({})
  const savingLesson = ref<number | null>(null)

  const distribute = reactive<DistributeState>({
    open: false,
    loading: false,
    totalLessons: null,
    instructions: '',
  })

  function subjectId(): number | undefined {
    return opts.getSubjectId?.() ?? plan.value?.group.subject?.id ?? undefined
  }

  function initSelections(): void {
    for (const key of Object.keys(lessonSelections)) delete lessonSelections[Number(key)]
    for (const lesson of plan.value?.lessons ?? []) {
      lessonSelections[lesson.lessonNumber] = lesson.topics.map((t) => t.id)
    }
  }

  async function loadPlan(): Promise<void> {
    loading.value = !plan.value
    try {
      plan.value = await fetchGroupPlan(groupId)
      initSelections()
    } finally {
      loading.value = false
    }
  }

  async function loadSyllabuses(): Promise<void> {
    loadingSyllabuses.value = true
    try {
      const { data } = await fetchSyllabuses({
        centerId: opts.getCenterId?.(),
        subjectId: subjectId(),
        page: 1,
        perPage: 100,
      })
      syllabusOptions.value = data.map((s) => ({ label: s.name, value: s.id }))
    } finally {
      loadingSyllabuses.value = false
    }
  }

  async function attachSyllabus(): Promise<void> {
    if (selectedSyllabusId.value === null) return
    attaching.value = true
    try {
      await setGroupSyllabus(groupId, selectedSyllabusId.value)
      notify.success('Sillabus biriktirildi')
      selectedSyllabusId.value = null
      await loadPlan()
    } finally {
      attaching.value = false
    }
  }

  async function replaceSyllabus(syllabusId: number): Promise<void> {
    attaching.value = true
    try {
      await setGroupSyllabus(groupId, syllabusId)
      notify.success('Sillabus almashtirildi')
      await loadPlan()
    } finally {
      attaching.value = false
    }
  }

  async function detachSyllabus(): Promise<void> {
    detaching.value = true
    try {
      await setGroupSyllabus(groupId, null)
      notify.success('Sillabus uzildi')
      await loadPlan()
      await loadSyllabuses()
    } finally {
      detaching.value = false
    }
  }

  function isTopicSelected(lessonNumber: number, topicId: number): boolean {
    return (lessonSelections[lessonNumber] ?? []).includes(topicId)
  }

  function toggleTopic(lessonNumber: number, topicId: number, checked: boolean): void {
    const current = lessonSelections[lessonNumber] ?? []
    lessonSelections[lessonNumber] = checked
      ? [...new Set([...current, topicId])]
      : current.filter((id) => id !== topicId)
  }

  function isLessonDirty(lessonNumber: number): boolean {
    const lesson = plan.value?.lessons.find((l) => l.lessonNumber === lessonNumber)
    if (!lesson) return false
    const original = lesson.topics.map((t) => t.id).sort()
    const current = [...(lessonSelections[lessonNumber] ?? [])].sort()
    return JSON.stringify(original) !== JSON.stringify(current)
  }

  async function saveLessonTopics(lessonNumber: number): Promise<void> {
    savingLesson.value = lessonNumber
    try {
      await setLessonTopics(groupId, lessonNumber, lessonSelections[lessonNumber] ?? [])
      notify.success(t('common.saved'))
      await loadPlan()
    } finally {
      savingLesson.value = null
    }
  }

  function openDistribute(): void {
    distribute.open = true
    distribute.totalLessons = null
    distribute.instructions = ''
  }

  async function runDistribute(): Promise<void> {
    distribute.loading = true
    try {
      plan.value = await distributePlan(groupId, {
        totalLessons: distribute.totalLessons || undefined,
        instructions: distribute.instructions.trim() || undefined,
      })
      initSelections()
      notify.success('Reja qayta taqsimlandi')
      distribute.open = false
    } finally {
      distribute.loading = false
    }
  }

  async function init(): Promise<void> {
    await loadPlan()
    if (plan.value && !plan.value.syllabus) await loadSyllabuses()
  }

  return {
    plan,
    loading,
    syllabusOptions,
    loadingSyllabuses,
    selectedSyllabusId,
    attaching,
    detaching,
    lessonSelections,
    savingLesson,
    distribute,
    init,
    loadPlan,
    loadSyllabuses,
    attachSyllabus,
    replaceSyllabus,
    detachSyllabus,
    isTopicSelected,
    toggleTopic,
    isLessonDirty,
    saveLessonTopics,
    openDistribute,
    runDistribute,
  }
}
