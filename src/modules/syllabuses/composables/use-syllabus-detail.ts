import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useNotificationStore } from '@/stores/notification.store'
import { fetchSyllabusById, createTopic, reorderTopics } from '../api/syllabuses.api'
import { fetchSubjects } from '@/modules/subjects/api/subjects.api'
import { optionalRequest, emptyPage } from '@/shared/permissions/optional-request'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { Syllabus } from '../interfaces/syllabus.interface'
import type { SyllabusTopic } from '../interfaces/syllabus-topic.interface'
import type { TopicForm } from '../interfaces/topic-form.interface'
import { t } from '@/locales'

/**
 * State + logic for the syllabus DETAIL page (`/syllabuses/:id`): loads the
 * syllabus, keeps `topics` sorted by `orderIndex`, owns the add-topic dialog and
 * the topic-editor drawer, and performs an OPTIMISTIC drag-reorder that rolls
 * back locally if the request fails (the http interceptor shows the error).
 */
export function useSyllabusDetail() {
  const route = useRoute()
  const notify = useNotificationStore()

  const syllabusId = computed(() => String(route.params.id))
  const syllabus = ref<Syllabus | null>(null)
  const topics = ref<SyllabusTopic[]>([])
  const loading = ref(false)

  const addOpen = ref(false)
  const editorOpen = ref(false)
  const selectedTopic = ref<SyllabusTopic | null>(null)

  async function load(): Promise<void> {
    loading.value = !syllabus.value
    try {
      const data = await fetchSyllabusById(syllabusId.value)
      syllabus.value = data
      topics.value = [...(data.topics ?? [])].sort((a, b) => a.orderIndex - b.orderIndex)
    } finally {
      loading.value = false
    }
  }

  function openAdd(): void {
    addOpen.value = true
  }

  async function submitAddTopic(form: TopicForm): Promise<void> {
    await createTopic(syllabusId.value, form)
    addOpen.value = false
    notify.success(t('syllabuses.topicAdded'))
    await load()
  }

  const editOpen = ref(false)
  const subjectOptions = ref<SelectOption[]>([])

  /** Edit the syllabus itself. The backend only accepts a subject of the
   *  syllabus's own center, so the options are loaded for that center. */
  async function openEditSyllabus(): Promise<void> {
    const centerId = syllabus.value?.center?.id
    const page = await optionalRequest(fetchSubjects({ centerId, page: 1, perPage: 100 }), emptyPage())
    subjectOptions.value = page.data.map((s) => ({ label: s.name, value: s.id }))
    editOpen.value = true
  }

  function openEditor(topic: SyllabusTopic): void {
    selectedTopic.value = topic
    editorOpen.value = true
  }

  /** Optimistic reorder: move locally, persist, roll back on failure. */
  async function reorder(fromIndex: number, toIndex: number): Promise<void> {
    if (fromIndex === toIndex) return
    const previous = [...topics.value]
    const next = [...topics.value]
    const [moved] = next.splice(fromIndex, 1)
    if (!moved) return
    next.splice(toIndex, 0, moved)
    topics.value = next
    try {
      await reorderTopics(syllabusId.value, next.map((t) => t.id))
    } catch {
      // Roll back — the http interceptor already surfaced the error toast.
      topics.value = previous
    }
  }

  return {
    syllabusId,
    syllabus,
    topics,
    loading,
    addOpen,
    editorOpen,
    selectedTopic,
    editOpen,
    subjectOptions,
    load,
    openAdd,
    openEditSyllabus,
    submitAddTopic,
    openEditor,
    reorder,
  }
}
