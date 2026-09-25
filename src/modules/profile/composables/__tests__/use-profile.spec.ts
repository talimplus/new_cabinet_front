import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProfile } from '../use-profile'
import { fetchMyProfile, updateMyProfile } from '../../api/profile.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { UserRole } from '@/shared/enums/user-role.enum'
import type { Profile } from '../../interfaces/profile.interface'

vi.mock('../../api/profile.api', () => ({
  fetchMyProfile: vi.fn(),
  updateMyProfile: vi.fn(),
}))

const mockedFetchMyProfile = vi.mocked(fetchMyProfile)
const mockedUpdateMyProfile = vi.mocked(updateMyProfile)

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 1,
    firstName: 'Ali',
    lastName: 'Valiyev',
    login: 'ali',
    phone: '998901112233',
    role: UserRole.ADMIN,
    roleName: 'Administrator',
    salary: null,
    commissionPercentage: null,
    ...overrides,
  }
}

describe('useProfile', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('load()', () => {
    it('sets profile from fetchMyProfile', async () => {
      const profile = makeProfile()
      mockedFetchMyProfile.mockResolvedValueOnce(profile)
      const p = useProfile()

      await p.load()

      expect(mockedFetchMyProfile).toHaveBeenCalled()
      expect(p.profile.value).toEqual(profile)
    })
  })

  describe('isTeacher', () => {
    it('is true only when profile.role === UserRole.TEACHER', async () => {
      mockedFetchMyProfile.mockResolvedValueOnce(makeProfile({ role: UserRole.TEACHER }))
      const p = useProfile()
      await p.load()
      expect(p.isTeacher.value).toBe(true)
    })

    it('is false for a non-teacher role', async () => {
      mockedFetchMyProfile.mockResolvedValueOnce(makeProfile({ role: UserRole.ADMIN }))
      const p = useProfile()
      await p.load()
      expect(p.isTeacher.value).toBe(false)
    })

    it('is false before the profile has loaded', () => {
      const p = useProfile()
      expect(p.isTeacher.value).toBe(false)
    })
  })

  describe('initialValues', () => {
    it('reflects the loaded profile with an empty password', async () => {
      const profile = makeProfile({ firstName: 'Vali', lastName: 'Aliyev', login: 'vali', phone: '998907654321' })
      mockedFetchMyProfile.mockResolvedValueOnce(profile)
      const p = useProfile()
      await p.load()

      expect(p.initialValues.value).toEqual({
        firstName: 'Vali',
        lastName: 'Aliyev',
        login: 'vali',
        phone: '998907654321',
        password: '',
      })
    })

    it('is all-empty before the profile has loaded', () => {
      const p = useProfile()
      expect(p.initialValues.value).toEqual({
        firstName: '',
        lastName: '',
        login: '',
        phone: '',
        password: '',
      })
    })
  })

  describe('isDirty()', () => {
    it('is false when values equal initialValues', async () => {
      const profile = makeProfile()
      mockedFetchMyProfile.mockResolvedValueOnce(profile)
      const p = useProfile()
      await p.load()

      expect(p.isDirty({ ...p.initialValues.value })).toBe(false)
    })

    it('is true when any field differs', async () => {
      const profile = makeProfile()
      mockedFetchMyProfile.mockResolvedValueOnce(profile)
      const p = useProfile()
      await p.load()

      expect(p.isDirty({ ...p.initialValues.value, firstName: 'Boshqa' })).toBe(true)
      expect(p.isDirty({ ...p.initialValues.value, lastName: 'Boshqa' })).toBe(true)
      expect(p.isDirty({ ...p.initialValues.value, login: 'boshqa' })).toBe(true)
      expect(p.isDirty({ ...p.initialValues.value, phone: '998900000000' })).toBe(true)
    })

    it('is true when a non-empty password is present even if other fields match', async () => {
      const profile = makeProfile()
      mockedFetchMyProfile.mockResolvedValueOnce(profile)
      const p = useProfile()
      await p.load()

      expect(p.isDirty({ ...p.initialValues.value, password: 'newpass123' })).toBe(true)
    })
  })

  describe('submit()', () => {
    it('omits a blank password, trims fields, notifies success, and updates profile', async () => {
      const profile = makeProfile()
      mockedFetchMyProfile.mockResolvedValueOnce(profile)
      const p = useProfile()
      await p.load()

      const updated = makeProfile({ firstName: 'Yangi' })
      mockedUpdateMyProfile.mockResolvedValueOnce(updated)
      const notify = useNotificationStore()

      await p.submit({
        firstName: '  Yangi  ',
        lastName: '  Valiyev  ',
        login: '  ali  ',
        phone: '  998901112233  ',
        password: '',
      })

      expect(mockedUpdateMyProfile).toHaveBeenCalledWith({
        firstName: 'Yangi',
        lastName: 'Valiyev',
        login: 'ali',
        phone: '998901112233',
      })
      const sentPayload = mockedUpdateMyProfile.mock.calls[0]![0]
      expect(sentPayload).not.toHaveProperty('password')

      expect(p.profile.value).toEqual(updated)
      expect(notify.items).toHaveLength(1)
      expect(notify.items[0]!.type).toBe(NotificationType.SUCCESS)
    })

    it('trims and includes a non-blank password', async () => {
      const profile = makeProfile()
      mockedFetchMyProfile.mockResolvedValueOnce(profile)
      const p = useProfile()
      await p.load()

      mockedUpdateMyProfile.mockResolvedValueOnce(profile)

      await p.submit({
        firstName: 'Ali',
        lastName: 'Valiyev',
        login: 'ali',
        phone: '998901112233',
        password: '  secret123  ',
      })

      expect(mockedUpdateMyProfile).toHaveBeenCalledWith({
        firstName: 'Ali',
        lastName: 'Valiyev',
        login: 'ali',
        phone: '998901112233',
        password: 'secret123',
      })
    })
  })
})
