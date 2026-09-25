import { computed, ref } from 'vue'
import {
  fetchStudentTelegramLink,
  regenerateStudentTelegramQr,
  unlinkTelegramParent,
} from '../api/student-card.api'
import { optionalRequest } from '@/shared/permissions/optional-request'
import { useNotificationStore } from '@/stores/notification.store'
import type { TelegramStudentLink } from '../interfaces/telegram-link.interface'
import { t } from '@/locales'

/**
 * The parent-bot card on the student page: a deep link + QR the parent scans
 * once, and the chats already listening. Regenerating invalidates the old QR
 * immediately but does NOT disconnect parents who already joined.
 */
export function useTelegramParent(studentId: () => number | null) {
  const notify = useNotificationStore()

  const link = ref<TelegramStudentLink | null>(null)
  const loading = ref(false)
  const regenerating = ref(false)
  const confirmOpen = ref(false)
  const unlinkingId = ref<number | null>(null)

  const parents = computed(() => link.value?.parents ?? [])
  const active = computed(() => parents.value.filter((p) => p.isActive))
  /**
   * Only the ones who BLOCKED the bot are surfaced: an admin knows about the
   * links they cut themselves, but not about a parent who silently blocked it
   * — that is why the messages stopped arriving.
   */
  const blocked = computed(() => parents.value.filter((p) => !p.isActive && p.blockedAt))

  async function load(): Promise<void> {
    const id = studentId()
    if (!id) return
    loading.value = true
    try {
      link.value = await optionalRequest(fetchStudentTelegramLink(id), null)
    } catch {
      link.value = null
    } finally {
      loading.value = false
    }
  }

  async function regenerate(): Promise<void> {
    const id = studentId()
    if (!id) return
    regenerating.value = true
    try {
      link.value = await regenerateStudentTelegramQr(id)
      confirmOpen.value = false
      notify.success(t('telegram.parentCard.regenerated'))
    } catch {
      /* toasted by the interceptor */
    } finally {
      regenerating.value = false
    }
  }

  async function unlink(linkId: number): Promise<void> {
    unlinkingId.value = linkId
    try {
      await unlinkTelegramParent(linkId)
      await load()
      notify.success(t('telegram.parentCard.unlinked'))
    } catch {
      /* toasted by the interceptor */
    } finally {
      unlinkingId.value = null
    }
  }

  async function copyLink(): Promise<void> {
    const deepLink = link.value?.deepLink
    if (!deepLink) return
    try {
      await navigator.clipboard.writeText(deepLink)
      notify.success(t('telegram.parentCard.copied'))
    } catch {
      notify.error(t('telegram.parentCard.copyFailed'))
    }
  }

  /** The QR is already a data URL, so it saves without another request. */
  function downloadQr(studentName: string): void {
    const src = link.value?.qrDataUrl
    if (!src) return
    const anchor = document.createElement('a')
    anchor.href = src
    anchor.download = `${(studentName || 'student').trim().replace(/\s+/g, '_')}_telegram_qr.png`
    anchor.click()
  }

  return {
    link, loading, regenerating, confirmOpen, unlinkingId,
    active, blocked,
    load, regenerate, unlink, copyLink, downloadQr,
  }
}
