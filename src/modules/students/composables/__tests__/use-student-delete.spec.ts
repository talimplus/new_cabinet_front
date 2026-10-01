import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useStudentDelete } from '../use-student-delete'
import { deleteStudent } from '../../api/students.api'
import { StudentStatus } from '../../enums/student-status.enum'
import { useNotificationStore } from '@/stores/notification.store'
import { t } from '@/locales'
import type { DeletableStudent } from '../../interfaces/student-delete.interface'

vi.mock('../../api/students.api', () => ({ deleteStudent: vi.fn() }))

const perm = ref(true)
vi.mock('@/shared/composables/use-permissions', () => ({
  usePermissions: () => ({ canDeleteStudent: perm }),
}))

const mockedDelete = vi.mocked(deleteStudent)

const fresh: DeletableStudent = { id: 5, firstName: 'Ali', lastName: 'Valiyev', status: StudentStatus.NEW }
const active: DeletableStudent = { ...fresh, id: 6, status: StudentStatus.ACTIVE }

describe('useStudentDelete', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    perm.value = true
  })

  it('canDelete requires permission and NEW status', () => {
    const d = useStudentDelete(vi.fn())
    expect(d.canDelete(fresh)).toBe(true)
    expect(d.canDelete(active)).toBe(false)
    expect(d.canDelete(null)).toBe(false)
    perm.value = false
    expect(d.canDelete(fresh)).toBe(false)
  })

  it('request ignores non-deletable students', () => {
    const d = useStudentDelete(vi.fn())
    d.request(active)
    expect(d.target.value).toBeNull()
    d.request(fresh)
    expect(d.target.value).toEqual(fresh)
  })

  it('name is the trimmed full name, empty without target', () => {
    const d = useStudentDelete(vi.fn())
    expect(d.name.value).toBe('')
    d.request({ ...fresh, lastName: '' })
    expect(d.name.value).toBe('Ali')
    d.request(fresh)
    expect(d.name.value).toBe('Ali Valiyev')
  })

  it('confirm deletes, toasts, clears target and awaits onDeleted', async () => {
    mockedDelete.mockResolvedValueOnce({ success: true })
    let finished = false
    const onDeleted = vi.fn(async () => {
      await Promise.resolve()
      finished = true
    })
    const d = useStudentDelete(onDeleted)
    const notify = useNotificationStore()
    const success = vi.spyOn(notify, 'success')
    d.request(fresh)

    await d.confirm()

    expect(mockedDelete).toHaveBeenCalledWith(5)
    expect(success).toHaveBeenCalledWith(t('students.messages.deleted'))
    expect(d.target.value).toBeNull()
    expect(onDeleted).toHaveBeenCalledTimes(1)
    expect(finished).toBe(true)
    expect(d.deleting.value).toBe(false)
  })

  it('deleting is true while the request is in flight', async () => {
    let resolve!: (v: { success: boolean }) => void
    mockedDelete.mockReturnValueOnce(new Promise((r) => (resolve = r)))
    const d = useStudentDelete(vi.fn())
    d.request(fresh)

    const p = d.confirm()
    expect(d.deleting.value).toBe(true)
    resolve({ success: true })
    await p
    expect(d.deleting.value).toBe(false)
  })

  it('on rejection: no onDeleted, no success toast, target cleared, deleting false', async () => {
    mockedDelete.mockRejectedValueOnce(new Error('400'))
    const onDeleted = vi.fn()
    const d = useStudentDelete(onDeleted)
    const success = vi.spyOn(useNotificationStore(), 'success')
    d.request(fresh)

    await d.confirm()

    expect(onDeleted).not.toHaveBeenCalled()
    expect(success).not.toHaveBeenCalled()
    expect(d.target.value).toBeNull()
    expect(d.deleting.value).toBe(false)
  })

  it('confirm without a target does nothing', async () => {
    const d = useStudentDelete(vi.fn())
    await d.confirm()
    expect(mockedDelete).not.toHaveBeenCalled()
  })

  it('cancel clears the target but not while deleting', async () => {
    const d = useStudentDelete(vi.fn())
    d.request(fresh)
    d.cancel()
    expect(d.target.value).toBeNull()

    mockedDelete.mockReturnValueOnce(new Promise(() => {}))
    d.request(fresh)
    void d.confirm()
    d.cancel()
    expect(d.target.value).toEqual(fresh)
  })
})
