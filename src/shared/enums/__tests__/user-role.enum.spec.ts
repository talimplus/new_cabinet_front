import { describe, it, expect } from 'vitest'
import { UserRole, USER_ROLE_LABEL_KEYS } from '../user-role.enum'
import { ROLE_LABEL_KEYS } from '@/modules/users/config/role-labels'
import { t } from '@/locales'

describe('USER_ROLE_LABEL_KEYS', () => {
  it('has a label key for every UserRole value', () => {
    for (const role of Object.values(UserRole)) {
      expect(USER_ROLE_LABEL_KEYS[role]).toBeTruthy()
    }
  })

  it('resolves every label key to a real, non-empty translation', () => {
    for (const role of Object.values(UserRole)) {
      const key = USER_ROLE_LABEL_KEYS[role]
      const label = t(key)
      expect(label).toBeTruthy()
      expect(label).not.toBe(key)
    }
  })

  it('is re-exported as ROLE_LABEL_KEYS from modules/users/config/role-labels', () => {
    expect(ROLE_LABEL_KEYS).toBe(USER_ROLE_LABEL_KEYS)
  })
})
