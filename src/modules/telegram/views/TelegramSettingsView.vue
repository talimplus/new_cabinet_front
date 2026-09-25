<template>
  <div class="mx-auto max-w-3xl space-y-4">
    <div v-if="s.loading.value" class="grid place-items-center py-16 text-muted-foreground">
      <UiSpinner />
    </div>

    <template v-else-if="s.settings.value">
      <TelegramBotCard
        v-model:token="s.tokenInput.value"
        v-model:changing="s.changingToken.value"
        :settings="s.settings.value"
        :token-error="s.tokenError.value"
        :saving-token="s.savingToken.value"
        :removing-token="s.removingToken.value"
        @save="s.saveToken"
        @remove="s.removeToken"
        @cancel="s.cancelTokenChange"
      />

      <TelegramNotificationsCard
        v-model:is-enabled="s.form.isEnabled"
        v-model:notify-payment-received="s.form.notifyPaymentReceived"
        v-model:notify-payment-confirmed="s.form.notifyPaymentConfirmed"
        v-model:notify-absence="s.form.notifyAbsence"
        v-model:notify-debt="s.form.notifyDebt"
        v-model:debt-reminder-day="s.form.debtReminderDay"
        :day-error="s.dayError.value"
        :saving="s.saving.value"
        :sending-reminders="s.sendingReminders.value"
        @save="s.save"
        @send="s.sendReminders"
      />

      <TelegramHowItWorks />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { UiSpinner } from '@/shared/components'
import { useTelegramSettings } from '../composables/use-telegram-settings'
import TelegramBotCard from '../components/TelegramBotCard.vue'
import TelegramNotificationsCard from '../components/TelegramNotificationsCard.vue'
import TelegramHowItWorks from '../components/TelegramHowItWorks.vue'

const s = useTelegramSettings()
onMounted(s.load)
</script>
