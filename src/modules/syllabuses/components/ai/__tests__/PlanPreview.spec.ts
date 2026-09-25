import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlanPreview from '../PlanPreview.vue'
import { UiBadge } from '@/shared/components'
import { TopicDifficulty, TOPIC_DIFFICULTY_LABEL_KEYS } from '../../../enums/topic-difficulty.enum'
import type { AiPlan } from '../../../interfaces/ai-syllabus.interface'
import { t } from '@/locales'

const plan: AiPlan = {
  name: 'Algebra 7',
  description: 'Yillik reja',
  totalLessons: null,
  topics: [
    { title: 'Sonlar', description: null, difficulty: TopicDifficulty.EASY, estimatedLessons: 3 },
    { title: 'Tenglamalar', description: null, difficulty: TopicDifficulty.HARD, estimatedLessons: 5 },
  ],
}

describe('PlanPreview', () => {
  it('renders the plan name, every topic and a difficulty badge per topic', () => {
    const wrapper = mount(PlanPreview, { props: { plan } })

    expect(wrapper.text()).toContain('Algebra 7')
    expect(wrapper.text()).toContain('Sonlar')
    expect(wrapper.text()).toContain('Tenglamalar')
    expect(wrapper.findAllComponents(UiBadge)).toHaveLength(2)
    expect(wrapper.text()).toContain(t(TOPIC_DIFFICULTY_LABEL_KEYS[TopicDifficulty.EASY]))
    expect(wrapper.text()).toContain(t(TOPIC_DIFFICULTY_LABEL_KEYS[TopicDifficulty.HARD]))
  })

  it('falls back to summing estimatedLessons when totalLessons is null', () => {
    const wrapper = mount(PlanPreview, { props: { plan } })
    expect(wrapper.text()).toContain('Darslar: 8')
  })

  it('emits "save" when the save button is clicked', async () => {
    const wrapper = mount(PlanPreview, { props: { plan } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('save')).toHaveLength(1)
  })
})
