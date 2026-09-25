import { describe, it, expect } from 'vitest'
import { resolveHome } from '../resolve-home'
import { Permission, ALL_PERMISSIONS } from '@/shared/enums/permission.enum'

describe('resolveHome', () => {
  it('sends an admin to the dashboard', () => {
    expect(resolveHome([ALL_PERMISSIONS])).toBe('/')
  })

  it('sends a teacher to today', () => {
    expect(resolveHome([Permission.TEACHER_TODAY, Permission.GROUPS_VIEW])).toBe('/today')
  })

  it('sends reception to the student list when it has no earlier key', () => {
    expect(resolveHome([Permission.STUDENTS_VIEW, Permission.PAYMENTS_VIEW])).toBe('/students')
  })

  it('respects the priority order', () => {
    // statistics wins over everything below it
    expect(resolveHome([Permission.PAYMENTS_VIEW, Permission.STATISTICS_VIEW])).toBe('/')
    // groups wins over students
    expect(resolveHome([Permission.STUDENTS_VIEW, Permission.GROUPS_VIEW])).toBe('/groups')
  })

  it('falls back to the ungated profile page', () => {
    expect(resolveHome([])).toBe('/profile')
    expect(resolveHome([Permission.STAFF_ATTENDANCE_CHECK_IN])).toBe('/profile')
  })
})
