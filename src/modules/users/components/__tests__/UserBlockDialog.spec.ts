import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserBlockDialog from '../UserBlockDialog.vue'
import { UiConfirmDialog } from '@/shared/components'
import { UserRole } from '@/shared/enums/user-role.enum'
import { t } from '@/locales'
import type { User } from '../../interfaces/user.interface'

const user: User = {
  id: 5, firstName: 'Ali', lastName: 'Valiyev', login: 'ali', phone: '1',
  role: UserRole.TEACHER, centerId: 2, salary: null, commissionPercentage: null,
}

describe('UserBlockDialog', () => {
  it('is closed without a user', () => {
    const w = mount(UserBlockDialog, { props: { user: null } })
    expect(w.findComponent(UiConfirmDialog).props('modelValue')).toBe(false)
  })

  it('asks to block an active user (danger)', () => {
    const w = mount(UserBlockDialog, { props: { user } })
    const d = w.findComponent(UiConfirmDialog)
    expect(d.props('modelValue')).toBe(true)
    expect(d.props('title')).toBe(t('users.blockConfirm.title'))
    expect(d.props('message')).toBe(t('users.blockConfirm.blockText', { name: 'Ali Valiyev' }))
    expect(d.props('variant')).toBe('danger')
  })

  it('asks to unblock a blocked user and forwards confirm/cancel', async () => {
    const w = mount(UserBlockDialog, { props: { user: { ...user, isActive: false } } })
    const d = w.findComponent(UiConfirmDialog)
    expect(d.props('title')).toBe(t('users.unblock'))
    expect(d.props('variant')).toBe('primary')
    d.vm.$emit('confirm')
    d.vm.$emit('cancel')
    expect(w.emitted('confirm')).toHaveLength(1)
    expect(w.emitted('cancel')).toHaveLength(1)
  })
})
