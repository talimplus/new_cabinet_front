import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import TopicEditorDrawer from '../TopicEditorDrawer.vue'
import { t } from '@/locales'
import type { SyllabusTopic } from '../../../interfaces/syllabus-topic.interface'

vi.mock('../../../api/syllabuses.api', () => ({
  updateTopic: vi.fn(),
  deleteTopic: vi.fn(),
  generateTopicContent: vi.fn(),
}))

// UiModal only renders when open, so sub-dialogs (aiOpen/confirmDelete=false)
// stay hidden; other Ui* are simplified so text/variant assertions are stable.
const stubs = {
  UiModal: {
    name: 'UiModal',
    props: ['modelValue', 'title', 'size'],
    template: '<div v-if="modelValue"><slot name="header" /><slot /><slot name="footer" /></div>',
  },
  UiButton: {
    name: 'UiButton',
    props: ['variant', 'size', 'loading', 'disabled'],
    template: '<button :data-variant="variant"><slot /></button>',
  },
  UiIconButton: {
    name: 'UiIconButton',
    props: ['icon', 'label', 'tone', 'disabled'],
    template: '<button :aria-label="label" :data-tone="tone" />',
  },
  UiIcon: { name: 'UiIcon', props: ['icon', 'size'], template: '<i class="ui-icon" />' },
  UiInput: { name: 'UiInput', props: ['modelValue', 'label', 'disabled'], template: '<input />' },
  UiTextarea: { name: 'UiTextarea', props: ['modelValue', 'label', 'disabled'], template: '<textarea />' },
  UiSelect: { name: 'UiSelect', props: ['modelValue', 'options', 'disabled'], template: '<div class="ui-select" />' },
  UiMarkdown: { name: 'UiMarkdown', props: ['source'], template: '<div class="ui-markdown" />' },
}

function makeTopic(): SyllabusTopic {
  return {
    id: 1,
    orderIndex: 0,
    title: 'Kirish',
    description: null,
    difficulty: null,
    estimatedLessons: null,
    guide: null,
    lessonOutline: null,
    homework: null,
  }
}

function mountDrawer(readonly: boolean) {
  return mount(TopicEditorDrawer, {
    props: { modelValue: true, syllabusId: '7', topic: makeTopic(), readonly },
    global: { stubs },
  })
}

describe('TopicEditorDrawer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('shows Save and the delete button when editable', () => {
    const wrapper = mountDrawer(false)

    expect(wrapper.text()).toContain(t('common.save'))
    // The header delete button is now a UiIconButton, identified by its accessible label.
    expect(wrapper.find(`[aria-label="${t('common.delete')}"]`).exists()).toBe(true)
  })

  it('hides Save and delete when readonly (preview only)', () => {
    const wrapper = mountDrawer(true)

    expect(wrapper.text()).not.toContain(t('common.save'))
    expect(wrapper.find(`[aria-label="${t('common.delete')}"]`).exists()).toBe(false)
  })

  it('shows the cancel label in the footer when editable', () => {
    const wrapper = mountDrawer(false)

    expect(wrapper.text()).toContain(t('common.cancel'))
    expect(wrapper.text()).not.toContain(t('common.close'))
  })

  it('shows the close label in the footer when readonly', () => {
    const wrapper = mountDrawer(true)

    expect(wrapper.text()).toContain(t('common.close'))
    expect(wrapper.text()).not.toContain(t('common.cancel'))
  })
})
