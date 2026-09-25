<template>
  <section class="rounded-lg border border-border bg-surface shadow-card">
    <div class="border-b border-border p-5">
      <h2 class="text-lg font-bold text-foreground">{{ t('telegram.settings.notificationsTitle') }}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{{ t('telegram.settings.notificationsHint') }}</p>
    </div>

    <div class="space-y-4 p-5">
      <TelegramToggleRow
        v-model="isEnabled"
        :label="t('telegram.settings.isEnabled')"
        :hint="t('telegram.settings.isEnabledHint')"
      />
      <hr class="border-border" />

      <TelegramToggleRow
        v-model="notifyPaymentReceived"
        :disabled="!isEnabled"
        :label="t('telegram.settings.notifyPaymentReceived')"
        :hint="t('telegram.settings.notifyPaymentReceivedHint')"
      />
      <TelegramToggleRow
        v-model="notifyPaymentConfirmed"
        :disabled="!isEnabled"
        :label="t('telegram.settings.notifyPaymentConfirmed')"
        :hint="t('telegram.settings.notifyPaymentConfirmedHint')"
      />
      <TelegramToggleRow
        v-model="notifyAbsence"
        :disabled="!isEnabled"
        :label="t('telegram.settings.notifyAbsence')"
        :hint="t('telegram.settings.notifyAbsenceHint')"
      />
      <TelegramToggleRow
        v-model="notifyDebt"
        :disabled="!isEnabled"
        :label="t('telegram.settings.notifyDebt')"
        :hint="t('telegram.settings.notifyDebtHint')"
      />

      <UiInput
        v-if="notifyDebt"
        v-model.number="debtReminderDay"
        type="number"
        :label="t('telegram.settings.debtReminderDay')"
        :error="dayError"
        :disabled="!isEnabled"
        class="ms-[30px] max-w-[240px]"
      />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-2 border-t border-border p-5">
      <UiButton
        v-if="notifyDebt && isEnabled"
        variant="outline"
        :loading="sendingReminders"
        @click="emit('send')"
      >
        <UiIcon :icon="Bell" :size="16" /> {{ t('telegram.settings.sendNow') }}
      </UiButton>
      <span v-else />
      <UiButton :loading="saving" :disabled="!!dayError" @click="emit('save')">{{ t('common.save') }}</UiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiInput, UiButton, UiIcon } from '@/shared/components'
import { Bell } from '@/shared/icons'
import TelegramToggleRow from './TelegramToggleRow.vue'

const { t } = useI18n()

interface Props {
  dayError: string
  saving: boolean
  sendingReminders: boolean
}
defineProps<Props>()
const emit = defineEmits<{ save: []; send: [] }>()

const isEnabled = defineModel<boolean>('isEnabled', { required: true })
const notifyPaymentReceived = defineModel<boolean>('notifyPaymentReceived', { required: true })
const notifyPaymentConfirmed = defineModel<boolean>('notifyPaymentConfirmed', { required: true })
const notifyAbsence = defineModel<boolean>('notifyAbsence', { required: true })
const notifyDebt = defineModel<boolean>('notifyDebt', { required: true })
const debtReminderDay = defineModel<number>('debtReminderDay', { required: true })
</script>
