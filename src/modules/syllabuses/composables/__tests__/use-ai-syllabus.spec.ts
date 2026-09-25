import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAiSyllabus } from '../use-ai-syllabus'
import { aiChat as aiChatApi, aiSavePlan as aiSavePlanApi } from '../../api/syllabuses.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { ChatRole } from '../../enums/chat-role.enum'
import { AiResponseType } from '../../enums/ai-response-type.enum'
import { TopicDifficulty } from '../../enums/topic-difficulty.enum'
import type { AiPlan } from '../../interfaces/ai-syllabus.interface'
import type { Syllabus } from '../../interfaces/syllabus.interface'

vi.mock('../../api/syllabuses.api', () => ({
  aiChat: vi.fn(),
  aiSavePlan: vi.fn(),
}))

const mockedAiChat = vi.mocked(aiChatApi)
const mockedAiSavePlan = vi.mocked(aiSavePlanApi)

function makePlan(): AiPlan {
  return {
    name: 'Algebra 7',
    description: 'Yillik reja',
    totalLessons: 20,
    topics: [
      { title: 'Sonlar', description: null, difficulty: TopicDifficulty.EASY, estimatedLessons: 3 },
      { title: 'Tenglamalar', description: null, difficulty: TopicDifficulty.HARD, estimatedLessons: 5 },
    ],
  }
}

describe('useAiSyllabus', () => {
  let onCreated: Mock<(message: string) => void>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    onCreated = vi.fn<(message: string) => void>()
  })

  describe('send()', () => {
    it('appends the user message then the assistant reply, keeping currentPlan empty for a QUESTION', async () => {
      mockedAiChat.mockResolvedValueOnce({ type: AiResponseType.QUESTION, message: 'Qaysi sinf?' })
      const ai = useAiSyllabus(onCreated)
      ai.input.value = 'salom'

      await ai.send()

      expect(mockedAiChat).toHaveBeenCalledTimes(1)
      expect(mockedAiChat.mock.calls[0]![0].subjectId).toBeUndefined()
      expect(ai.messages.value).toEqual([
        { role: ChatRole.USER, content: 'salom' },
        { role: ChatRole.ASSISTANT, content: 'Qaysi sinf?' },
      ])
      expect(ai.input.value).toBe('')
      expect(ai.currentPlan.value).toBeNull()
    })

    it('does nothing for blank input', async () => {
      const ai = useAiSyllabus(onCreated)
      ai.input.value = '   '
      await ai.send()
      expect(mockedAiChat).not.toHaveBeenCalled()
    })

    it('sets currentPlan (a copy of the topics) when the response type is PLAN', async () => {
      const plan = makePlan()
      mockedAiChat.mockResolvedValueOnce({ type: AiResponseType.PLAN, message: 'Mana reja', plan })
      const ai = useAiSyllabus(onCreated)
      ai.subjectId.value = 5
      ai.input.value = 'reja tuz'

      await ai.send()

      expect(mockedAiChat.mock.calls[0]![0].subjectId).toBe(5)
      expect(ai.currentPlan.value?.name).toBe('Algebra 7')
      expect(ai.currentPlan.value?.topics).toHaveLength(2)
      // topics are cloned, not the same references from the response
      expect(ai.currentPlan.value?.topics[0]).not.toBe(plan.topics[0])
    })
  })

  describe('savePlan()', () => {
    async function withPlan() {
      mockedAiChat.mockResolvedValueOnce({ type: AiResponseType.PLAN, message: 'ok', plan: makePlan() })
      const ai = useAiSyllabus(onCreated)
      ai.subjectId.value = 5
      ai.input.value = 'reja'
      await ai.send()
      return ai
    }

    it('sends the mapped payload, notifies success, calls onCreated and resets state', async () => {
      const ai = await withPlan()
      mockedAiSavePlan.mockResolvedValueOnce({ id: 99 } as Syllabus)

      const result = await ai.savePlan()

      expect(mockedAiSavePlan).toHaveBeenCalledWith({
        subjectId: 5,
        name: 'Algebra 7',
        description: 'Yillik reja',
        topics: [
          { title: 'Sonlar', description: null, difficulty: TopicDifficulty.EASY, estimatedLessons: 3 },
          { title: 'Tenglamalar', description: null, difficulty: TopicDifficulty.HARD, estimatedLessons: 5 },
        ],
      })
      expect(result).toEqual({ id: 99 })
      expect(onCreated).toHaveBeenCalledTimes(1)
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
      // reset() ran
      expect(ai.currentPlan.value).toBeNull()
      expect(ai.messages.value).toHaveLength(0)
      expect(ai.subjectId.value).toBeNull()
    })

    it('refuses to save without a subject and pushes an error instead of calling the api', async () => {
      mockedAiChat.mockResolvedValueOnce({ type: AiResponseType.PLAN, message: 'ok', plan: makePlan() })
      const ai = useAiSyllabus(onCreated)
      ai.input.value = 'reja'
      await ai.send() // subjectId stays null

      const result = await ai.savePlan()

      expect(result).toBeNull()
      expect(mockedAiSavePlan).not.toHaveBeenCalled()
      expect(onCreated).not.toHaveBeenCalled()
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.ERROR)).toBe(true)
    })

    it('returns null when there is no plan yet', async () => {
      const ai = useAiSyllabus(onCreated)
      const result = await ai.savePlan()
      expect(result).toBeNull()
      expect(mockedAiSavePlan).not.toHaveBeenCalled()
    })
  })

  describe('reset()', () => {
    it('clears every piece of conversation state', () => {
      const ai = useAiSyllabus(onCreated)
      ai.subjectId.value = 7
      ai.input.value = 'text'
      ai.messages.value.push({ role: ChatRole.USER, content: 'hi' })
      ai.currentPlan.value = makePlan()

      ai.reset()

      expect(ai.subjectId.value).toBeNull()
      expect(ai.input.value).toBe('')
      expect(ai.messages.value).toHaveLength(0)
      expect(ai.currentPlan.value).toBeNull()
    })
  })
})
