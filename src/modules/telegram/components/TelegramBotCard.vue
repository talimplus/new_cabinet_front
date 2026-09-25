<template>
  <section class="rounded-lg border border-border bg-surface shadow-card">
    <div class="border-b border-border p-5">
      <h2 class="text-lg font-bold text-foreground">{{ t('telegram.settings.botTitle') }}</h2>
    </div>

    <div class="space-y-4 p-5">
      <p
        :class="cn('rounded-md px-3 py-2 text-sm', statusClass)"
      >
        <template v-if="settings.botConnected">
          {{ t('telegram.settings.connected', { bot: settings.botUsername ?? '' }) }}
        </template>
        <template v-else-if="settings.botConfigured">{{ t('telegram.settings.tokenSetNotConnected') }}</template>
        <template v-else>{{ t('telegram.settings.noBot') }}</template>
      </p>

      <!-- Token stored: show the mask, offer change / disconnect -->
      <div v-if="settings.botConfigured && !changing" class="flex flex-wrap items-center gap-3">
        <div class="min-w-0">
          <div class="text-xs text-muted-foreground">{{ t('telegram.settings.currentToken') }}</div>
          <div class="truncate font-mono text-sm font-medium text-foreground">{{ settings.botTokenMasked }}</div>
        </div>
        <div class="ms-auto flex flex-wrap gap-2">
          <UiButton variant="outline" @click="changing = true">{{ t('telegram.settings.changeToken') }}</UiButton>
          <UiButton variant="danger" :loading="removingToken" @click="emit('remove')">
            <UiIcon :icon="Link2Off" :size="16" /> {{ t('telegram.settings.disconnectBot') }}
          </UiButton>
        </div>
      </div>

      <!-- Enter / change token -->
      <template v-else>
        <p class="text-sm text-muted-foreground">{{ t('telegram.settings.botHint') }}</p>
        <UiInput
          v-model="token"
          :label="t('telegram.settings.tokenLabel')"
          placeholder="1234567890:AAF-..."
          autocomplete="off"
          :error="tokenError"
          class="max-w-lg"
        />
        <div class="flex gap-2">
          <UiButton :loading="savingToken" :disabled="!token.trim()" @click="emit('save')">
            {{ t('telegram.settings.connectBot') }}
          </UiButton>
          <UiButton v-if="changing" variant="ghost" @click="emit('cancel')">{{ t('common.cancel') }}</UiButton>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiInput, UiButton, UiIcon } from '@/shared/components'
import { Link2Off } from '@/shared/icons'
import { cn } from '@/shared/utils/cn'
import type { TelegramSettings } from '../interfaces/telegram-settings.interface'

const { t } = useI18n()

interface Props {
  settings: TelegramSettings
  tokenError: string
  savingToken: boolean
  removingToken: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{ save: []; remove: []; cancel: [] }>()

const token = defineModel<string>('token', { required: true })
const changing = defineModel<boolean>('changing', { required: true })

const statusClass = computed(() =>
  props.settings.botConnected
    ? 'bg-success-soft text-success'
    : props.settings.botConfigured
      ? 'bg-warning-soft text-warning'
      : 'bg-info-soft text-info',
)
</script>
