import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TopicList from '../TopicList.vue'
import type { SyllabusTopic } from '../../../interfaces/syllabus-topic.interface'
import { t } from '@/locales'

function makeTopic(id: number, orderIndex: number): SyllabusTopic {
  return {
    id,
    orderIndex,
    title: `Mavzu ${id}`,
    description: null,
    difficulty: null,
    estimatedLessons: null,
    guide: null,
    lessonOutline: null,
    homework: null,
  }
}

const topics = [makeTopic(1, 0), makeTopic(2, 1), makeTopic(3, 2)]

describe('TopicList', () => {
  it('shows the empty state text when there are no topics', () => {
    const wrapper = mount(TopicList, { props: { topics: [], editable: true } })

    expect(wrapper.text()).toContain(t('syllabuses.editor.noTopics'))
  })

  it('renders one TopicCard per topic', () => {
    const wrapper = mount(TopicList, { props: { topics, editable: true } })

    expect(wrapper.findAll('li')).toHaveLength(3)
  })

  it('emits reorder [0, 2] on a drag+drop sequence when editable', async () => {
    const wrapper = mount(TopicList, { props: { topics, editable: true } })
    const cards = wrapper.findAll('li')

    await cards[0]?.trigger('dragstart')
    await cards[2]?.trigger('drop')

    expect(wrapper.emitted('reorder')).toEqual([[0, 2]])
  })

  it('does not emit reorder when not editable', async () => {
    const wrapper = mount(TopicList, { props: { topics, editable: false } })
    const cards = wrapper.findAll('li')

    await cards[0]?.trigger('dragstart')
    await cards[2]?.trigger('drop')

    expect(wrapper.emitted('reorder')).toBeUndefined()
  })

  // Touch browsers ignore HTML5 drag — the up/down buttons are the phone path.
  describe('move up / move down buttons', () => {
    const upSel = `button[aria-label="${t('syllabuses.editor.moveUp')}"]`
    const downSel = `button[aria-label="${t('syllabuses.editor.moveDown')}"]`

    it('emits reorder to the neighbouring index without opening the topic', async () => {
      const wrapper = mount(TopicList, { props: { topics, editable: true } })
      const cards = wrapper.findAll('li')

      await cards[1]!.find(upSel).trigger('click')
      await cards[1]!.find(downSel).trigger('click')

      expect(wrapper.emitted('reorder')).toEqual([[1, 0], [1, 2]])
      expect(wrapper.emitted('open')).toBeUndefined()
    })

    it('disables "up" on the first topic and "down" on the last', () => {
      const cards = mount(TopicList, { props: { topics, editable: true } }).findAll('li')

      expect(cards[0]!.find(upSel).attributes('disabled')).toBeDefined()
      expect(cards[0]!.find(downSel).attributes('disabled')).toBeUndefined()
      expect(cards[2]!.find(downSel).attributes('disabled')).toBeDefined()
    })

    it('hides the buttons when not editable', () => {
      const wrapper = mount(TopicList, { props: { topics, editable: false } })

      expect(wrapper.find(upSel).exists()).toBe(false)
      expect(wrapper.find(downSel).exists()).toBe(false)
    })
  })
})
