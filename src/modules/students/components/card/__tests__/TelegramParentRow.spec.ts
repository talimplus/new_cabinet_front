import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TelegramParentRow from '../TelegramParentRow.vue'
import { formatDate } from '@/shared/utils/format-date'
import { t } from '@/locales'
import type { TelegramParent } from '../../../interfaces/telegram-link.interface'

function makeParent(overrides: Partial<TelegramParent> = {}): TelegramParent {
  return { id: 1, firstName: 'Vali', lastName: 'Aliyev', isActive: true, ...overrides }
}

function mountRow(props: Record<string, unknown> = {}) {
  return mount(TelegramParentRow, { props: { parent: makeParent(), ...props } })
}

describe('TelegramParentRow', () => {
  it('shows the joined first + last name', () => {
    expect(mountRow().text()).toContain('Vali Aliyev')
  })

  it('falls back to the unnamed label when both names are empty', () => {
    const text = mountRow({ parent: makeParent({ firstName: '', lastName: '' }) }).text()
    expect(text).toContain(t('telegram.parentCard.unnamed'))
  })

  it('prefixes the username with @ only when present', () => {
    expect(mountRow({ parent: makeParent({ username: 'vali_a' }) }).text()).toContain('@vali_a')
    expect(mountRow({ parent: makeParent({ username: null }) }).text()).not.toContain('@')
  })

  it('renders the linked date via formatDate', () => {
    const text = mountRow({ parent: makeParent({ linkedAt: '2026-01-15' }) }).text()
    expect(text).toContain(formatDate('2026-01-15'))
  })

  it('shows the unlink button only with canEdit and emits unlink with the parent id', async () => {
    expect(mountRow({ canEdit: false }).findAll('button')).toHaveLength(0)

    const wrapper = mountRow({ parent: makeParent({ id: 7 }), canEdit: true })
    const button = wrapper.get('button')
    await button.trigger('click')
    expect(wrapper.emitted('unlink')?.[0]).toEqual([7])
  })
})
