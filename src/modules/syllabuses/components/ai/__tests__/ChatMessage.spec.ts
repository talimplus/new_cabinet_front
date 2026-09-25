import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatMessage from '../ChatMessage.vue'
import { UiMarkdown } from '@/shared/components'
import { ChatRole } from '../../../enums/chat-role.enum'

describe('ChatMessage', () => {
  it('aligns a user message to the right and renders plain text (no markdown)', () => {
    const wrapper = mount(ChatMessage, {
      props: { message: { role: ChatRole.USER, content: 'Salom' } },
    })

    expect(wrapper.get('div').classes()).toContain('justify-end')
    expect(wrapper.findComponent(UiMarkdown).exists()).toBe(false)
    expect(wrapper.text()).toContain('Salom')
  })

  it('aligns an assistant message to the left and renders it through UiMarkdown', () => {
    const wrapper = mount(ChatMessage, {
      props: { message: { role: ChatRole.ASSISTANT, content: '**Reja**' } },
    })

    expect(wrapper.get('div').classes()).toContain('justify-start')
    const md = wrapper.findComponent(UiMarkdown)
    expect(md.exists()).toBe(true)
    expect(md.props('source')).toBe('**Reja**')
  })
})
