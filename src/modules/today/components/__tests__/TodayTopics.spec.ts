import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TodayTopics from '../TodayTopics.vue'
import { TopicDifficulty, TOPIC_DIFFICULTY_LABEL_KEYS } from '@/modules/groups/enums/topic-difficulty.enum'
import { t } from '@/locales'
import type { SyllabusTopic } from '@/modules/syllabuses/interfaces/syllabus-topic.interface'

function makeTopic(overrides: Partial<SyllabusTopic> = {}): SyllabusTopic {
  return {
    id: 1,
    orderIndex: 0,
    title: 'Mavzu',
    description: null,
    difficulty: TopicDifficulty.EASY,
    estimatedLessons: null,
    guide: null,
    lessonOutline: null,
    homework: null,
    ...overrides,
  }
}

describe('TodayTopics', () => {
  it('renders one collapse per today-topic with the title and a difficulty badge', () => {
    const topics = [
      makeTopic({ id: 1, title: 'Massivlar', difficulty: TopicDifficulty.EASY }),
      makeTopic({ id: 2, title: 'Obyektlar', difficulty: TopicDifficulty.HARD }),
    ]
    const wrapper = mount(TodayTopics, { props: { topics, previousTopics: [] } })

    const collapses = wrapper.findAllComponents({ name: 'UiCollapse' })
    expect(collapses).toHaveLength(2)

    expect(wrapper.text()).toContain('Massivlar')
    expect(wrapper.text()).toContain('Obyektlar')
    expect(wrapper.text()).toContain(t(TOPIC_DIFFICULTY_LABEL_KEYS[TopicDifficulty.EASY]))
    expect(wrapper.text()).toContain(t(TOPIC_DIFFICULTY_LABEL_KEYS[TopicDifficulty.HARD]))
  })

  it('renders the today-topics heading only when there are topics', () => {
    const withTopics = mount(TodayTopics, { props: { topics: [makeTopic()], previousTopics: [] } })
    expect(withTopics.text()).toContain(t('syllabuses.today.todayTopics'))

    const withoutTopics = mount(TodayTopics, { props: { topics: [], previousTopics: [] } })
    expect(withoutTopics.text()).not.toContain(t('syllabuses.today.todayTopics'))
  })

  it('shows the previous-topics collapse with the count and a chip per previous topic', async () => {
    const previousTopics = [
      makeTopic({ id: 10, title: 'Kirish' }),
      makeTopic({ id: 11, title: 'Sintaksis' }),
    ]
    const wrapper = mount(TodayTopics, { props: { topics: [], previousTopics } })

    expect(wrapper.text()).toContain(`${t('syllabuses.today.previousTopics')} (2)`)

    // the previous-topics chips live inside the collapse body — expand it
    await wrapper.get('button').trigger('click')
    expect(wrapper.text()).toContain('Kirish')
    expect(wrapper.text()).toContain('Sintaksis')
  })

  it('hides the previous-topics collapse when there are none', () => {
    const wrapper = mount(TodayTopics, { props: { topics: [makeTopic()], previousTopics: [] } })
    expect(wrapper.text()).not.toContain(t('syllabuses.today.previousTopics'))
  })
})
