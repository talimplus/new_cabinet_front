import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTelegramParent } from '../use-telegram-parent'
import {
  fetchStudentTelegramLink as fetchStudentTelegramLinkApi,
  regenerateStudentTelegramQr as regenerateStudentTelegramQrApi,
  unlinkTelegramParent as unlinkTelegramParentApi,
} from '../../api/student-card.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { t } from '@/locales'
import type { TelegramParent, TelegramStudentLink } from '../../interfaces/telegram-link.interface'

import type * as StudentCardApiModule from '../../api/student-card.api'

type StudentCardApi = typeof StudentCardApiModule

vi.mock('../../api/student-card.api', () => ({
  fetchStudentPaymentSummary: vi.fn<StudentCardApi['fetchStudentPaymentSummary']>(),
  payStudentDebt: vi.fn<StudentCardApi['payStudentDebt']>(),
  fetchStudentTelegramLink: vi.fn<StudentCardApi['fetchStudentTelegramLink']>(),
  regenerateStudentTelegramQr: vi.fn<StudentCardApi['regenerateStudentTelegramQr']>(),
  unlinkTelegramParent: vi.fn<StudentCardApi['unlinkTelegramParent']>(),
}))

const mockedFetchLink = vi.mocked(fetchStudentTelegramLinkApi)
const mockedRegenerate = vi.mocked(regenerateStudentTelegramQrApi)
const mockedUnlink = vi.mocked(unlinkTelegramParentApi)

function makeParent(overrides: Partial<TelegramParent> = {}): TelegramParent {
  return {
    id: 1,
    firstName: 'Guljon',
    lastName: 'Ona',
    username: 'guljon',
    isActive: true,
    ...overrides,
  }
}

function makeLink(overrides: Partial<TelegramStudentLink> = {}): TelegramStudentLink {
  return {
    studentId: 1,
    botUsername: 'talimplus_bot',
    botConfigured: true,
    deepLink: 'https://t.me/talimplus_bot?start=abc',
    qrDataUrl: 'data:image/png;base64,AAAA',
    parents: [],
    ...overrides,
  }
}

describe('useTelegramParent', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('load()', () => {
    it('stores the link', async () => {
      const link = makeLink()
      mockedFetchLink.mockResolvedValueOnce(link)
      const tg = useTelegramParent(() => 1)

      await tg.load()

      expect(tg.link.value).toEqual(link)
      expect(tg.loading.value).toBe(false)
    })

    it('active keeps only isActive parents', async () => {
      mockedFetchLink.mockResolvedValueOnce(
        makeLink({
          parents: [
            makeParent({ id: 1, isActive: true }),
            makeParent({ id: 2, isActive: false, blockedAt: '2026-09-01' }),
          ],
        }),
      )
      const tg = useTelegramParent(() => 1)

      await tg.load()

      expect(tg.active.value.map((p) => p.id)).toEqual([1])
    })

    it('blocked keeps only inactive parents that have blockedAt', async () => {
      mockedFetchLink.mockResolvedValueOnce(
        makeLink({
          parents: [
            makeParent({ id: 1, isActive: false, blockedAt: '2026-09-01' }),
            // admin-cut link: inactive but no blockedAt -> must NOT appear
            makeParent({ id: 2, isActive: false, blockedAt: null }),
            makeParent({ id: 3, isActive: true }),
          ],
        }),
      )
      const tg = useTelegramParent(() => 1)

      await tg.load()

      expect(tg.blocked.value.map((p) => p.id)).toEqual([1])
    })
  })

  describe('regenerate()', () => {
    it('swaps in the new link, closes the confirm dialog and notifies', async () => {
      const newLink = makeLink({ deepLink: 'https://t.me/talimplus_bot?start=new' })
      mockedRegenerate.mockResolvedValueOnce(newLink)
      const tg = useTelegramParent(() => 1)
      tg.confirmOpen.value = true

      await tg.regenerate()

      expect(mockedRegenerate).toHaveBeenCalledWith(1)
      expect(tg.link.value).toEqual(newLink)
      expect(tg.confirmOpen.value).toBe(false)
      expect(tg.regenerating.value).toBe(false)
      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.SUCCESS,
          message: t('telegram.parentCard.regenerated'),
        }),
      )
    })
  })

  describe('unlink()', () => {
    it('calls the api, reloads, notifies and resets unlinkingId', async () => {
      mockedUnlink.mockResolvedValueOnce(undefined)
      mockedFetchLink.mockResolvedValueOnce(makeLink())
      const tg = useTelegramParent(() => 1)

      await tg.unlink(7)

      expect(mockedUnlink).toHaveBeenCalledWith(7)
      expect(mockedFetchLink).toHaveBeenCalledWith(1)
      expect(tg.unlinkingId.value).toBeNull()
      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.SUCCESS,
          message: t('telegram.parentCard.unlinked'),
        }),
      )
    })
  })

  describe('copyLink()', () => {
    it('writes deepLink to the clipboard and notifies success', async () => {
      const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValueOnce(undefined)
      vi.stubGlobal('navigator', { clipboard: { writeText } })
      mockedFetchLink.mockResolvedValueOnce(makeLink({ deepLink: 'https://t.me/bot?start=x' }))
      const tg = useTelegramParent(() => 1)
      await tg.load()

      await tg.copyLink()

      expect(writeText).toHaveBeenCalledWith('https://t.me/bot?start=x')
      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.SUCCESS,
          message: t('telegram.parentCard.copied'),
        }),
      )
      vi.unstubAllGlobals()
    })

    it('notifies an error when the clipboard write rejects', async () => {
      const writeText = vi.fn<(text: string) => Promise<void>>().mockRejectedValueOnce(new Error('denied'))
      vi.stubGlobal('navigator', { clipboard: { writeText } })
      mockedFetchLink.mockResolvedValueOnce(makeLink({ deepLink: 'https://t.me/bot?start=x' }))
      const tg = useTelegramParent(() => 1)
      await tg.load()

      await tg.copyLink()

      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.ERROR,
          message: t('telegram.parentCard.copyFailed'),
        }),
      )
      vi.unstubAllGlobals()
    })

    it('does nothing with no deepLink', async () => {
      const writeText = vi.fn<(text: string) => Promise<void>>()
      vi.stubGlobal('navigator', { clipboard: { writeText } })
      mockedFetchLink.mockResolvedValueOnce(makeLink({ deepLink: null }))
      const tg = useTelegramParent(() => 1)
      await tg.load()

      await tg.copyLink()

      expect(writeText).not.toHaveBeenCalled()
      vi.unstubAllGlobals()
    })
  })

  describe('downloadQr()', () => {
    it('creates an anchor with the underscored filename and clicks it', async () => {
      mockedFetchLink.mockResolvedValueOnce(makeLink({ qrDataUrl: 'data:image/png;base64,AAAA' }))
      const tg = useTelegramParent(() => 1)
      await tg.load()
      const clickSpy = vi.fn<() => void>()
      const anchor = { href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement
      const createSpy = vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor)

      tg.downloadQr('Ali Valiyev')

      expect(anchor.download).toBe('Ali_Valiyev_telegram_qr.png')
      expect(anchor.href).toBe('data:image/png;base64,AAAA')
      expect(clickSpy).toHaveBeenCalledTimes(1)
      createSpy.mockRestore()
    })

    it('does nothing with no qrDataUrl', async () => {
      mockedFetchLink.mockResolvedValueOnce(makeLink({ qrDataUrl: null }))
      const tg = useTelegramParent(() => 1)
      await tg.load()
      const createSpy = vi.spyOn(document, 'createElement')

      tg.downloadQr('Ali Valiyev')

      expect(createSpy).not.toHaveBeenCalled()
      createSpy.mockRestore()
    })
  })
})
