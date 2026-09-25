<template>
  <div class="flex flex-wrap items-center gap-2 border-t border-border py-1.5 first:border-t-0">
    <UiIcon :icon="UserCheck" :size="16" class="text-success" />
    <span class="text-sm text-foreground">{{ name }}</span>
    <span v-if="parent.username" class="text-xs text-muted-foreground">@{{ parent.username }}</span>
    <span class="text-xs text-muted-foreground">· {{ formatDate(parent.linkedAt) }}</span>

    <UiIconButton
      v-if="canEdit"
      :icon="Link2Off"
      tone="danger"
      class="ms-auto"
      :label="t('telegram.parentCard.unlink')"
      :disabled="unlinking"
      @click="emit('unlink', parent.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiIcon, UiIconButton } from '@/shared/components'
import { UserCheck, Link2Off } from '@/shared/icons'
import { formatDate } from '@/shared/utils/format-date'
import type { TelegramParent } from '../../interfaces/telegram-link.interface'

const { t } = useI18n()

const props = defineProps<{ parent: TelegramParent; canEdit?: boolean; unlinking?: boolean }>()
const emit = defineEmits<{ unlink: [linkId: number] }>()

const name = computed(
  () =>
    `${props.parent.firstName ?? ''} ${props.parent.lastName ?? ''}`.trim() ||
    t('telegram.parentCard.unnamed'),
)
</script>
