import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useGroupPauses } from '../use-group-pauses'
import {
  fetchGroupPauses as fetchGroupPausesApi,
  createGroupPause as createGroupPauseApi,
  deleteGroupPause as deleteGroupPauseApi,
} from '../../api/group-pauses.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { t } from '@/locales'
import type { GroupPause } from '../../interfaces/group-pause.interface'

vi.mock('../../api/group-pauses.api', () => ({
  fetchGroupPauses: vi.fn(),
  createGroupPause: vi.fn(),
  deleteGroupPause: vi.fn(),
}))

const mockedFetch = vi.mocked(fetchGroupPausesApi)
const mockedCreate = vi.mocked(createGroupPauseApi)
const mockedDelete = vi.mocked(deleteGroupPauseApi)

const GROUP_ID = 12

function makePause(overrides: Partial<GroupPause> = {}): GroupPause {
  return {
    id: 3,
    groupId: GROUP_ID,
    fromDate: '2026-10-01',
    toDate: '2026-10-10',
    reason: 'Bayram',
    createdAt: '2026-09-27T10:00:00Z',
    ...overrides,
  }
}

function fillValid(s: ReturnType<typeof useGroupPauses>): void {
  s.form.fromDate = new Date(2026, 9, 1)
  s.form.toDate = new Date(2026, 9, 10)
  s.form.reason = '  Bayram  '
}

describe('useGroupPauses', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetch.mockResolvedValue([makePause()])
  })

  it('load() fetches the group pauses into the list', async () => {
    const s = useGroupPauses(GROUP_ID)
    await s.load()

    expect(mockedFetch).toHaveBeenCalledWith(GROUP_ID)
    expect(s.pauses.value).toEqual([makePause()])
    expect(s.loading.value).toBe(false)
  })

  it('openForm() opens the modal with a clean state', () => {
    const s = useGroupPauses(GROUP_ID)
    fillValid(s)
    s.form.errors = { reason: 'x' }

    s.openForm()

    expect(s.form.open).toBe(true)
    expect(s.form.fromDate).toBeNull()
    expect(s.form.toDate).toBeNull()
    expect(s.form.reason).toBe('')
    expect(s.form.errors).toEqual({})
  })

  describe('validation', () => {
    it('reports missing dates and an empty reason without calling the api', async () => {
      const s = useGroupPauses(GROUP_ID)
      s.openForm()
      s.form.reason = '   '

      await s.submit()

      expect(mockedCreate).not.toHaveBeenCalled()
      expect(s.form.errors).toEqual({
        fromDate: t('groups.pauses.validation.fromDate'),
        toDate: t('groups.pauses.validation.toDate'),
        reason: t('groups.pauses.validation.reason'),
      })
      expect(s.form.open).toBe(true)
    })

    it('rejects a toDate earlier than fromDate', async () => {
      const s = useGroupPauses(GROUP_ID)
      s.openForm()
      s.form.fromDate = new Date(2026, 9, 10)
      s.form.toDate = new Date(2026, 9, 1)
      s.form.reason = 'Bayram'

      await s.submit()

      expect(mockedCreate).not.toHaveBeenCalled()
      expect(s.form.errors).toEqual({ toDate: t('groups.pauses.validation.range') })
    })
  })

  describe('submit()', () => {
    it('sends YYYY-MM-DD dates + trimmed reason, notifies, closes and reloads', async () => {
      mockedCreate.mockResolvedValueOnce(makePause())
      const s = useGroupPauses(GROUP_ID)
      s.openForm()
      fillValid(s)

      await s.submit()
      await flushPromises()

      expect(mockedCreate).toHaveBeenCalledWith(GROUP_ID, {
        fromDate: '2026-10-01',
        toDate: '2026-10-10',
        reason: 'Bayram',
      })
      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.SUCCESS,
          message: t('groups.pauses.messages.created'),
        }),
      )
      expect(s.form.open).toBe(false)
      expect(s.form.saving).toBe(false)
      expect(mockedFetch).toHaveBeenCalledTimes(1)
    })

    it('maps a backend 422 into form.errors and keeps the modal open', async () => {
      mockedCreate.mockRejectedValueOnce({ response: { data: { errors: { fromDate: 'x' } } } })
      const s = useGroupPauses(GROUP_ID)
      s.openForm()
      fillValid(s)

      await s.submit()
      await flushPromises()

      expect(s.form.errors).toEqual({ fromDate: 'x' })
      expect(s.form.open).toBe(true)
      expect(s.form.saving).toBe(false)
      expect(mockedFetch).not.toHaveBeenCalled()
      expect(useNotificationStore().items).toHaveLength(0)
    })
  })

  describe('confirmDelete()', () => {
    it('deletes the pending pause, notifies, clears it and reloads', async () => {
      mockedDelete.mockResolvedValueOnce(undefined)
      const s = useGroupPauses(GROUP_ID)
      s.pendingDelete.value = makePause({ id: 8 })

      await s.confirmDelete()
      await flushPromises()

      expect(mockedDelete).toHaveBeenCalledWith(GROUP_ID, 8)
      expect(useNotificationStore().items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.SUCCESS,
          message: t('groups.pauses.messages.deleted'),
        }),
      )
      expect(s.pendingDelete.value).toBeNull()
      expect(s.deleting.value).toBe(false)
      expect(mockedFetch).toHaveBeenCalledTimes(1)
    })

    it('is a no-op when nothing is pending', async () => {
      const s = useGroupPauses(GROUP_ID)
      await s.confirmDelete()
      expect(mockedDelete).not.toHaveBeenCalled()
    })
  })

  it('setField patches the form; closeForm closes unless saving', () => {
    const p = useGroupPauses(7)
    p.openForm()
    const d = new Date(2026, 9, 1)
    p.setField({ fromDate: d, reason: 'ta’til' })
    expect(p.form.fromDate).toBe(d)
    expect(p.form.reason).toBe('ta’til')

    p.form.saving = true
    p.closeForm()
    expect(p.form.open).toBe(true)
    p.form.saving = false
    p.closeForm()
    expect(p.form.open).toBe(false)
  })
})
