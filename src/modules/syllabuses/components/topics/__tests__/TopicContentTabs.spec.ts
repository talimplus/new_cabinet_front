import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TopicContentTabs from '../TopicContentTabs.vue'
import { t } from '@/locales'

function mountTabs(props: Partial<InstanceType<typeof TopicContentTabs>['$props']> = {}) {
  return mount(TopicContentTabs, {
    props: { guide: '', lessonOutline: '', homework: '', ...props },
  })
}

function findButtonByText(wrapper: ReturnType<typeof mountTabs>, text: string) {
  return wrapper.findAll('button').find((b) => b.text().includes(text))
}

describe('TopicContentTabs', () => {
  it('renders the three content tab labels', () => {
    const wrapper = mountTabs()

    expect(wrapper.text()).toContain(t('syllabuses.content.guide'))
    expect(wrapper.text()).toContain(t('syllabuses.content.lessonOutline'))
    expect(wrapper.text()).toContain(t('syllabuses.content.homework'))
  })

  it('hides the AI button without canAi', () => {
    const wrapper = mountTabs({ canAi: false })

    expect(findButtonByText(wrapper, t('syllabuses.ai.generate'))).toBeUndefined()
  })

  it('shows the AI button when canAi is granted', () => {
    const wrapper = mountTabs({ canAi: true })

    expect(findButtonByText(wrapper, t('syllabuses.ai.generate'))).toBeDefined()
  })

  it('hides the AI button when readonly, even with canAi granted', () => {
    const wrapper = mountTabs({ canAi: true, readonly: true })

    expect(findButtonByText(wrapper, t('syllabuses.ai.generate'))).toBeUndefined()
  })

  it('emits generate when the AI button is clicked', async () => {
    const wrapper = mountTabs({ canAi: true })

    await findButtonByText(wrapper, t('syllabuses.ai.generate'))?.trigger('click')

    expect(wrapper.emitted('generate')).toHaveLength(1)
  })

  it('emits update:lessonOutline with the typed value after switching to the 2nd tab', async () => {
    const wrapper = mountTabs()

    await findButtonByText(wrapper, t('syllabuses.content.lessonOutline'))?.trigger('click')
    await wrapper.get('textarea').setValue('Dars rejasi matni')

    const lessonOutlineUpdates = wrapper.emitted('update:lessonOutline')
    expect(lessonOutlineUpdates?.[lessonOutlineUpdates.length - 1]).toEqual(['Dars rejasi matni'])
    expect(wrapper.emitted('update:guide')).toBeUndefined()
    expect(wrapper.emitted('update:homework')).toBeUndefined()
  })

  it('shows the not-filled placeholder in preview mode when the active content is empty', async () => {
    const wrapper = mountTabs()

    await findButtonByText(wrapper, t('syllabuses.content.preview'))?.trigger('click')

    expect(wrapper.find('textarea').exists()).toBe(false)
    expect(wrapper.text()).toContain(t('syllabuses.content.notFilled'))
  })

  it('hides the textarea and the edit/preview toggle when readonly', () => {
    const wrapper = mountTabs({ readonly: true })

    expect(wrapper.find('textarea').exists()).toBe(false)
    expect(findButtonByText(wrapper, t('common.edit'))).toBeUndefined()
    expect(findButtonByText(wrapper, t('syllabuses.content.preview'))).toBeUndefined()
  })
})
