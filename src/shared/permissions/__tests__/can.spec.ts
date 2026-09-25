import { describe, it, expect } from 'vitest'
import { hasPermission } from '../can'
import { Permission, ALL_PERMISSIONS } from '@/shared/enums/permission.enum'

describe('hasPermission', () => {
  it('grants when the user holds the required key', () => {
    expect(hasPermission([Permission.PAYMENTS_VIEW], [Permission.PAYMENTS_VIEW])).toBe(true)
  })

  it('denies when the user holds none of the required keys', () => {
    expect(hasPermission([Permission.GROUPS_VIEW], [Permission.PAYMENTS_VIEW])).toBe(false)
  })

  it('treats several required keys as OR — any one suffices', () => {
    const granted = [Permission.GROUPS_UPDATE]
    expect(hasPermission(granted, [Permission.USERS_VIEW, Permission.GROUPS_UPDATE])).toBe(true)
  })

  it('lets the wildcard satisfy everything', () => {
    expect(hasPermission([ALL_PERMISSIONS], [Permission.PAYROLL_DEDUCT])).toBe(true)
  })

  it('treats an empty requirement as open', () => {
    expect(hasPermission([], [])).toBe(true)
  })

  it('denies when the user has no keys yet (not loaded)', () => {
    expect(hasPermission([], [Permission.STUDENTS_VIEW])).toBe(false)
  })
})
