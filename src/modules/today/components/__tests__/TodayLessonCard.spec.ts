import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'
import TodayLessonCard from '../TodayLessonCard.vue'
import TodayTopics from '../TodayTopics.vue'
import { GroupStatus } from '@/modules/groups/enums/group-status.enum'
import { TopicDifficulty } from '@/modules/groups/enums/topic-difficulty.enum'
import { t } from '@/locales'
import type { TodayLesson } from '../../interfaces/teacher-today.interface'
import type { SyllabusTopic } from '@/modules/syllabuses/interfaces/syllabus-topic.interface'

vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a :href="to"><slot /></a>',
  },
}))

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

function makeLesson(overrides: Partial<TodayLesson> = {}): TodayLesson {
  return {
    group: {
      id: 1,
      name: 'JavaScript A1',
      status: GroupStatus.STARTED,
      subject: { id: 2, name: 'Dasturlash' },
      room: { id: 3, name: '204-xona' },
    },
    teacher: { id: 9, firstName: 'Ali', lastName: 'Valiyev' },
    date: '2026-09-24',
    startTime: '09:30',
    lessonNumber: 5,
    hasSyllabus: true,
    topics: [makeTopic()],
    previousTopics: [],
    ...overrides,
  }
}

describe('TodayLessonCard', () => {
  it('renders the HH:mm time, group name and lesson number badge', () => {
    const wrapper = mount(TodayLessonCard, { props: { lesson: makeLesson({ startTime: '09:30:00' }) } })

    expect(wrapper.text()).toContain('09:30')
    expect(wrapper.text()).toContain('JavaScript A1')
    expect(wrapper.text()).toContain(t('syllabuses.today.lessonNumber', { n: 5 }))
  })

  it('renders subject and room badges', () => {
    const wrapper = mount(TodayLessonCard, { props: { lesson: makeLesson() } })

    expect(wrapper.text()).toContain('Dasturlash')
    expect(wrapper.text()).toContain('204-xona')
  })

  it('shows the teacher badge only when showTeacher is true and a teacher exists', () => {
    const withTeacher = mount(TodayLessonCard, { props: { lesson: makeLesson(), showTeacher: true } })
    expect(withTeacher.text()).toContain('Ali Valiyev')

    const hiddenByFlag = mount(TodayLessonCard, { props: { lesson: makeLesson(), showTeacher: false } })
    expect(hiddenByFlag.text()).not.toContain('Ali Valiyev')

    const noTeacher = mount(TodayLessonCard, {
      props: { lesson: makeLesson({ teacher: null }), showTeacher: true },
    })
    expect(noTeacher.text()).not.toContain('Ali Valiyev')
  })

  it('shows the no-syllabus warning and a link to the group plan when hasSyllabus is false', () => {
    const wrapper = mount(TodayLessonCard, {
      props: { lesson: makeLesson({ hasSyllabus: false, topics: [] }) },
    })

    expect(wrapper.text()).toContain(t('syllabuses.today.noSyllabus'))
    const link = wrapper.find('a[href="/groups/1"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain(t('syllabuses.today.goToPlan'))
    expect(wrapper.findComponent(TodayTopics).exists()).toBe(false)
  })

  it('shows the no-topics-assigned notice when hasSyllabus is true but topics is empty', () => {
    const wrapper = mount(TodayLessonCard, {
      props: { lesson: makeLesson({ hasSyllabus: true, topics: [] }) },
    })

    expect(wrapper.text()).toContain(t('syllabuses.today.noTopicsAssigned'))
    expect(wrapper.text()).not.toContain(t('syllabuses.today.noSyllabus'))
    expect(wrapper.findComponent(TodayTopics).exists()).toBe(false)
  })

  it('renders the topics section when hasSyllabus is true and topics exist', () => {
    const wrapper = mount(TodayLessonCard, {
      props: { lesson: makeLesson({ hasSyllabus: true, topics: [makeTopic()] }) },
    })

    expect(wrapper.findComponent(TodayTopics).exists()).toBe(true)
    expect(wrapper.text()).not.toContain(t('syllabuses.today.noSyllabus'))
    expect(wrapper.text()).not.toContain(t('syllabuses.today.noTopicsAssigned'))
  })
})
