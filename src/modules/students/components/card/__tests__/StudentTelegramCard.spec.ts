import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentTelegramCard from '../StudentTelegramCard.vue'
import TelegramParentRow from '../TelegramParentRow.vue'
import { t } from '@/locales'
import type { TelegramParent, TelegramStudentLink } from '../../../interfaces/telegram-link.interface'

function makeLink(overrides: Partial<TelegramStudentLink> = {}): TelegramStudentLink {
  return {
    studentId: 1,
    botConfigured: true,
    deepLink: 'https://t.me/bot?start=abc',
    qrDataUrl: 'data:image/png;base64,AAAA',
    parents: [],
    ...overrides,
  }
}

function makeParent(overrides: Partial<TelegramParent> = {}): TelegramParent {
  return { id: 1, firstName: 'Vali', lastName: 'Aliyev', isActive: true, ...overrides }
}

function mountCard(props: Record<string, unknown> = {}) {
  return mount(StudentTelegramCard, {
    props: { link: makeLink(), active: [], blocked: [], ...props },
  })
}

describe('StudentTelegramCard', () => {
  it('shows only the bot-not-configured message when botConfigured is false', () => {
    const wrapper = mountCard({ link: makeLink({ botConfigured: false }) })
    expect(wrapper.text()).toContain(t('telegram.parentCard.botNotConfigured'))
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('input').exists()).toBe(false)
  })

  it('renders the QR image with the qrDataUrl as src when configured', () => {
    const wrapper = mountCard({ link: makeLink({ qrDataUrl: 'data:image/png;base64,ZZZZ' }) })
    const img = wrapper.get('img')
    expect(img.attributes('src')).toBe('data:image/png;base64,ZZZZ')
  })

  it('renders the deep link in a readonly input', () => {
    const wrapper = mountCard({ link: makeLink({ deepLink: 'https://t.me/bot?start=xyz' }) })
    const input = wrapper.get('input')
    expect((input.element as HTMLInputElement).value).toBe('https://t.me/bot?start=xyz')
    expect(input.attributes('readonly')).toBeDefined()
  })

  it('renders one TelegramParentRow per active parent, or the no-parents message', () => {
    const active = [makeParent({ id: 1 }), makeParent({ id: 2 })]
    const withParents = mountCard({ active })
    expect(withParents.findAllComponents(TelegramParentRow)).toHaveLength(2)
    expect(withParents.text()).not.toContain(t('telegram.parentCard.noParents'))

    const noParents = mountCard({ active: [] })
    expect(noParents.findAllComponents(TelegramParentRow)).toHaveLength(0)
    expect(noParents.text()).toContain(t('telegram.parentCard.noParents'))
  })

  it('shows the blocked line only when blocked is non-empty', () => {
    const blocked = [makeParent({ id: 3 }), makeParent({ id: 4 })]
    const withBlocked = mountCard({ blocked })
    expect(withBlocked.text()).toContain(t('telegram.parentCard.blocked', { count: 2 }))

    const noBlocked = mountCard({ blocked: [] })
    expect(noBlocked.text()).not.toContain(t('telegram.parentCard.blocked', { count: 0 }))
  })

  it('emits download / copy / regenerate-request from their buttons', async () => {
    const wrapper = mountCard({ canEdit: true })
    const buttons = wrapper.findAll('button')
    const download = buttons.find((b) => b.text().includes(t('telegram.parentCard.download')))!
    const regenerate = buttons.find((b) => b.text().includes(t('telegram.parentCard.regenerate')))!

    await download.trigger('click')
    expect(wrapper.emitted('download')).toHaveLength(1)

    await regenerate.trigger('click')
    expect(wrapper.emitted('regenerate-request')).toHaveLength(1)

    await wrapper.get('button[aria-label="' + t('telegram.parentCard.link') + '"]').trigger('click')
    expect(wrapper.emitted('copy')).toHaveLength(1)
  })

  it('shows the regenerate button only with canEdit', () => {
    const withEdit = mountCard({ canEdit: true })
    expect(withEdit.text()).toContain(t('telegram.parentCard.regenerate'))

    const withoutEdit = mountCard({ canEdit: false })
    expect(withoutEdit.text()).not.toContain(t('telegram.parentCard.regenerate'))
  })
})
