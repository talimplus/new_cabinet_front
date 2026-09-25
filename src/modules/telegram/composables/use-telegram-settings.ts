import { computed, reactive, ref } from 'vue'
import type { AxiosError } from 'axios'
import { t } from '@/locales'
import { useNotificationStore } from '@/stores/notification.store'
import { resolveErrorMessage } from '@/shared/utils/error-message'
import {
  fetchTelegramSettings,
  updateTelegramSettings,
  setTelegramBotToken,
  removeTelegramBotToken,
  sendTelegramDebtReminders,
} from '../api/telegram-settings.api'
import type {
  TelegramSettings,
  TelegramSettingsForm,
} from '../interfaces/telegram-settings.interface'

/**
 * `/telegram` page state: load the org's bot settings, edit the notification
 * switches, and manage the bot token. The token never comes back from the
 * server, so "change token" opens an empty field; a bad token is shown inline
 * (the request opts out of the global toast).
 */
export function useTelegramSettings() {
  const notify = useNotificationStore()

  const settings = ref<TelegramSettings | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const savingToken = ref(false)
  const removingToken = ref(false)
  const sendingReminders = ref(false)

  const tokenInput = ref('')
  const tokenError = ref('')
  const changingToken = ref(false)

  const form = reactive<TelegramSettingsForm>({
    isEnabled: true,
    notifyPaymentReceived: true,
    notifyPaymentConfirmed: false,
    notifyAbsence: false,
    notifyDebt: false,
    debtReminderDay: 10,
  })

  // Backend also enforces 1..28 — days 29–31 don't exist every month, so a
  // reminder set to them would silently never fire.
  const dayError = computed<string>(() => {
    if (!form.notifyDebt) return ''
    const day = Number(form.debtReminderDay)
    if (!Number.isInteger(day) || day < 1 || day > 28) return t('telegram.settings.dayError')
    return ''
  })

  function applyToForm(data: TelegramSettings): void {
    settings.value = data
    form.isEnabled = data.isEnabled
    form.notifyPaymentReceived = data.notifyPaymentReceived
    form.notifyPaymentConfirmed = data.notifyPaymentConfirmed
    form.notifyAbsence = data.notifyAbsence
    form.notifyDebt = data.notifyDebt
    form.debtReminderDay = data.debtReminderDay
  }

  async function load(): Promise<void> {
    loading.value = true
    try {
      applyToForm(await fetchTelegramSettings())
    } finally {
      loading.value = false
    }
  }

  async function save(): Promise<void> {
    if (dayError.value) return
    saving.value = true
    try {
      applyToForm(await updateTelegramSettings({ ...form }))
      notify.success(t('telegram.settings.saved'))
    } finally {
      saving.value = false
    }
  }

  async function saveToken(): Promise<void> {
    const token = tokenInput.value.trim()
    if (!token) return
    savingToken.value = true
    tokenError.value = ''
    try {
      applyToForm(await setTelegramBotToken(token))
      tokenInput.value = ''
      changingToken.value = false
      notify.success(t('telegram.settings.botConnected'))
    } catch (error) {
      // Field-level: the user fixes the value right here (no global toast).
      tokenError.value = resolveErrorMessage(error as AxiosError)
    } finally {
      savingToken.value = false
    }
  }

  function cancelTokenChange(): void {
    changingToken.value = false
    tokenInput.value = ''
    tokenError.value = ''
  }

  async function removeToken(): Promise<void> {
    removingToken.value = true
    try {
      applyToForm(await removeTelegramBotToken())
      notify.success(t('telegram.settings.botDisconnected'))
    } finally {
      removingToken.value = false
    }
  }

  async function sendReminders(): Promise<void> {
    sendingReminders.value = true
    try {
      const result = await sendTelegramDebtReminders()
      notify.success(t('telegram.settings.sent', { count: result.students }))
    } finally {
      sendingReminders.value = false
    }
  }

  return {
    settings,
    loading,
    saving,
    savingToken,
    removingToken,
    sendingReminders,
    tokenInput,
    tokenError,
    changingToken,
    form,
    dayError,
    load,
    save,
    saveToken,
    cancelTokenChange,
    removeToken,
    sendReminders,
  }
}
