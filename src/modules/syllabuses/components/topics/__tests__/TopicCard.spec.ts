import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TopicCard from '../TopicCard.vue'
import { TopicDifficulty, TOPIC_DIFFICULTY_VARIANTS } from '../../../enums/topic-difficulty.enum'
import { TopicContentKey, TOPIC_CONTENT_LABEL_KEYS } from '../../../enums/topic-content-key.enum'
import type { SyllabusTopic } from '../../../interfaces/syllabus-topic.interface'
import { t } from '@/locales'

// Deterministic stubs: UiIcon keeps the fall-through class, UiBadge exposes variant.
const stubs = {
  UiIcon: { name: 'UiIcon', props: ['icon', 'size'], template: '<i class="ui-icon" />' },
  UiBadge: {
    name: 'UiBadge',
    props: ['variant'],
    template: '<span class="ui-badge" :data-variant="variant"><slot /></span>',
  },
}

function makeTopic(overrides: Partial<SyllabusTopic> = {}): SyllabusTopic {
  return {
    id: 1,
    orderIndex: 0,
    title: 'Kirish',
    description: 'Tavsif',
    difficulty: null,
    estimatedLessons: null,
    guide: null,
    lessonOutline: null,
    homework: null,
    ...overrides,
  }
}

function mountCard(topic: SyllabusTopic, extra: Record<string, unknown> = {}) {
  return mount(TopicCard, { props: { topic, order: 1, editable: true, ...extra }, global: { stubs } })
}

describe('TopicCard', () => {
  it('renders the difficulty badge with the mapped variant', () => {
    const wrapper = mountCard(makeTopic({ difficulty: TopicDifficulty.HARD }))
    const badge = wrapper.find('.ui-badge')

    expect(badge.exists()).toBe(true)
    expect(badge.attributes('data-variant')).toBe(TOPIC_DIFFICULTY_VARIANTS[TopicDifficulty.HARD])
  })

  it('colors only the filled content indicators as success', () => {
    // guide filled; lessonOutline empty; homework whitespace-only → empty.
    const wrapper = mountCard(makeTopic({ guide: 'Mundarija', lessonOutline: null, homework: '  ' }))

    expect(wrapper.findAll('.text-success')).toHaveLength(1)
  })

  it('emits open when the card is clicked', async () => {
    const wrapper = mountCard(makeTopic())

    await wrapper.trigger('click')

    expect(wrapper.emitted('open')).toHaveLength(1)
  })

  it('renders the estimated lessons chip text via i18n', () => {
    const wrapper = mountCard(makeTopic({ estimatedLessons: 5 }))

    expect(wrapper.text()).toContain(t('syllabuses.editor.estimatedLessons', { n: 5 }))
  })

  it('renders the three content indicators with filled/not-filled aria-labels', () => {
    const wrapper = mountCard(makeTopic({ guide: 'Mundarija', lessonOutline: null, homework: null }))
    const indicators = wrapper.findAll('[role="img"]')

    expect(indicators).toHaveLength(3)
    expect(indicators[0]?.attributes('aria-label')).toBe(
      `${t(TOPIC_CONTENT_LABEL_KEYS[TopicContentKey.GUIDE])}: ${t('syllabuses.content.filled')}`,
    )
    expect(indicators[1]?.attributes('aria-label')).toBe(
      `${t(TOPIC_CONTENT_LABEL_KEYS[TopicContentKey.LESSON_OUTLINE])}: ${t('syllabuses.content.notFilled')}`,
    )
    expect(indicators[2]?.attributes('aria-label')).toBe(
      `${t(TOPIC_CONTENT_LABEL_KEYS[TopicContentKey.HOMEWORK])}: ${t('syllabuses.content.notFilled')}`,
    )
  })
})
