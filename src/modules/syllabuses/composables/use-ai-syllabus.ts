import { ref } from 'vue'
import { aiChat, aiSavePlan } from '../api/syllabuses.api'
import { useNotificationStore } from '@/stores/notification.store'
import { ChatRole } from '../enums/chat-role.enum'
import { AiResponseType } from '../enums/ai-response-type.enum'
import type { AiChatMessage, AiPlan } from '../interfaces/ai-syllabus.interface'
import type { Syllabus } from '../interfaces/syllabus.interface'
import { t } from '@/locales'

const SAVED_MESSAGE = 'AI reja saqlandi'

/**
 * All chat/plan state + logic for the AI syllabus builder. Keeps the modal shell
 * thin (≤100 lines). `onCreated` fires after a successful save so the list can
 * toast + refresh; the http interceptor owns all error toasts.
 */
export function useAiSyllabus(onCreated: (message: string) => void) {
  const notify = useNotificationStore()

  const subjectId = ref<number | null>(null)
  const messages = ref<AiChatMessage[]>([])
  const input = ref('')
  const loading = ref(false)
  const currentPlan = ref<AiPlan | null>(null)
  const saving = ref(false)

  async function send(): Promise<void> {
    const text = input.value.trim()
    if (!text || loading.value) return
    messages.value.push({ role: ChatRole.USER, content: text })
    input.value = ''
    loading.value = true
    try {
      const res = await aiChat({
        subjectId: subjectId.value ?? undefined,
        messages: messages.value,
      })
      messages.value.push({ role: ChatRole.ASSISTANT, content: res.message })
      if (res.type === AiResponseType.PLAN && res.plan) {
        currentPlan.value = { ...res.plan, topics: res.plan.topics.map((t) => ({ ...t })) }
      }
    } finally {
      loading.value = false
    }
  }

  async function savePlan(): Promise<Syllabus | null> {
    const plan = currentPlan.value
    if (!plan) return null
    if (subjectId.value === null) {
      notify.error(t('syllabuses.subjectRequired'))
      return null
    }
    saving.value = true
    try {
      const created = await aiSavePlan({
        subjectId: subjectId.value,
        name: plan.name,
        description: plan.description ?? undefined,
        topics: plan.topics,
      })
      notify.success(SAVED_MESSAGE)
      onCreated(SAVED_MESSAGE)
      reset()
      return created
    } finally {
      saving.value = false
    }
  }

  function reset(): void {
    subjectId.value = null
    messages.value = []
    input.value = ''
    currentPlan.value = null
    loading.value = false
    saving.value = false
  }

  return { subjectId, messages, input, loading, currentPlan, saving, send, savePlan, reset }
}
