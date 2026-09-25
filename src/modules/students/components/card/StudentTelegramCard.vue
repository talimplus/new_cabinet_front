<template>
  <div class="space-y-3 rounded-lg border border-border bg-surface p-4 shadow-card">
    <h3 class="flex items-center gap-2 text-base font-semibold text-foreground">
      <UiIcon :icon="Send" :size="18" class="text-primary" />
      {{ t('telegram.parentCard.title') }}
    </h3>

    <p v-if="loading" class="text-sm text-muted-foreground">{{ t('common.loading') }}</p>

    <!-- No bot token on the organization yet → there is no QR to hand out. -->
    <p
      v-else-if="link && !link.botConfigured"
      class="rounded-md bg-warning-soft px-3 py-2 text-sm text-warning"
    >
      {{ t('telegram.parentCard.botNotConfigured') }}
    </p>

    <div v-else-if="link" class="flex flex-col gap-4 sm:flex-row">
      <div class="shrink-0 text-center">
        <img
          v-if="link.qrDataUrl"
          :src="link.qrDataUrl"
          :alt="t('telegram.parentCard.title')"
          class="mx-auto h-44 w-44 rounded-lg border border-border bg-white"
        />
        <div class="mt-2 flex justify-center gap-1">
          <UiButton size="sm" variant="ghost" @click="emit('download')">
            <UiIcon :icon="Download" :size="16" />
            {{ t('telegram.parentCard.download') }}
          </UiButton>
          <UiButton v-if="canEdit" size="sm" variant="ghost" @click="emit('regenerate-request')">
            <UiIcon :icon="RefreshCw" :size="16" />
            {{ t('telegram.parentCard.regenerate') }}
          </UiButton>
        </div>
      </div>

      <div class="min-w-0 flex-1 space-y-3">
        <p class="text-sm text-muted-foreground">{{ t('telegram.parentCard.hint') }}</p>

        <div class="flex items-end gap-2">
          <div class="min-w-0 flex-1">
            <UiInput
              :model-value="link.deepLink ?? ''"
              :label="t('telegram.parentCard.link')"
              readonly
            />
          </div>
          <UiIconButton :icon="Copy" :label="t('telegram.parentCard.link')" @click="emit('copy')" />
        </div>

        <div>
          <p class="text-sm font-medium text-foreground">{{ t('telegram.parentCard.parents') }}</p>
          <p v-if="!active.length" class="text-sm text-muted-foreground">
            {{ t('telegram.parentCard.noParents') }}
          </p>
          <TelegramParentRow
            v-for="parent in active"
            :key="parent.id"
            :parent="parent"
            :can-edit="canEdit"
            :unlinking="unlinkingId === parent.id"
            @unlink="emit('unlink', $event)"
          />
          <!-- Explains why messages stopped for someone who is still "linked". -->
          <p v-if="blocked.length" class="mt-2 text-xs text-warning">
            {{ t('telegram.parentCard.blocked', { count: blocked.length }) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiButton, UiIcon, UiIconButton, UiInput } from '@/shared/components'
import { Send, Download, RefreshCw, Copy } from '@/shared/icons'
import TelegramParentRow from './TelegramParentRow.vue'
import type { TelegramParent, TelegramStudentLink } from '../../interfaces/telegram-link.interface'

const { t } = useI18n()

defineProps<{
  link: TelegramStudentLink | null
  active: TelegramParent[]
  blocked: TelegramParent[]
  loading?: boolean
  canEdit?: boolean
  unlinkingId?: number | null
}>()
const emit = defineEmits<{
  copy: []
  download: []
  'regenerate-request': []
  unlink: [linkId: number]
}>()
</script>
