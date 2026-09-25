import { reactive, ref, watch } from 'vue'
import { useNotificationStore } from '@/stores/notification.store'
import { updateTopic, deleteTopic, generateTopicContent } from '../api/syllabuses.api'
import { TopicDifficulty } from '../enums/topic-difficulty.enum'
import type { SyllabusTopic } from '../interfaces/syllabus-topic.interface'
import type { GenerateContentPayload } from '../interfaces/generate-content-payload.interface'
import { t } from '@/locales'

interface TopicEditorForm {
  title: string
  description: string
  difficulty: TopicDifficulty | null
  estimatedLessons: number | string
  guide: string
  lessonOutline: string
  homework: string
}

interface UseTopicEditorArgs {
  syllabusId: () => string | number
  topic: () => SyllabusTopic | null
  isOpen: () => boolean
  onSaved: () => void
  onDeleted: () => void
}

/**
 * Drawer logic for editing a single topic: mirrors the topic into an editable
 * form when the drawer opens, saves/deletes via the api, and fills the three
 * content fields from an AI generation (which is NOT persisted until Save).
 */
export function useTopicEditor(args: UseTopicEditorArgs) {
  const notify = useNotificationStore()

  const form = reactive<TopicEditorForm>({
    title: '',
    description: '',
    difficulty: null,
    estimatedLessons: '',
    guide: '',
    lessonOutline: '',
    homework: '',
  })
  const saving = ref(false)
  const generating = ref(false)
  const aiOpen = ref(false)
  const confirmDelete = ref(false)

  watch(
    () => [args.isOpen(), args.topic()] as const,
    ([open, topic]) => {
      if (!open || !topic) return
      form.title = topic.title ?? ''
      form.description = topic.description ?? ''
      form.difficulty = topic.difficulty ?? null
      form.estimatedLessons = topic.estimatedLessons ?? ''
      form.guide = topic.guide ?? ''
      form.lessonOutline = topic.lessonOutline ?? ''
      form.homework = topic.homework ?? ''
      aiOpen.value = false
      confirmDelete.value = false
    },
    { immediate: true },
  )

  async function save(): Promise<void> {
    const topic = args.topic()
    if (!topic) return
    saving.value = true
    try {
      await updateTopic(args.syllabusId(), topic.id, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        difficulty: form.difficulty || undefined,
        estimatedLessons: form.estimatedLessons === '' ? undefined : Number(form.estimatedLessons),
        guide: form.guide,
        lessonOutline: form.lessonOutline,
        homework: form.homework,
      })
      notify.success(t('common.saved'))
      args.onSaved()
    } finally {
      saving.value = false
    }
  }

  async function remove(): Promise<void> {
    const topic = args.topic()
    if (!topic) return
    await deleteTopic(args.syllabusId(), topic.id)
    notify.success(t('common.deleted'))
    confirmDelete.value = false
    args.onDeleted()
  }

  async function generate(payload: GenerateContentPayload): Promise<void> {
    const topic = args.topic()
    if (!topic) return
    generating.value = true
    try {
      const result = await generateTopicContent(args.syllabusId(), topic.id, payload)
      if (result.guide != null) form.guide = result.guide
      if (result.lessonOutline != null) form.lessonOutline = result.lessonOutline
      if (result.homework != null) form.homework = result.homework
      aiOpen.value = false
    } finally {
      generating.value = false
    }
  }

  return { form, saving, generating, aiOpen, confirmDelete, save, remove, generate }
}
