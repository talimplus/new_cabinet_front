<template>
  <div
    :class="
      cn(
        'flex flex-wrap items-center gap-3 rounded-lg border p-3 transition-colors',
        selectedCount ? 'border-primary/25 bg-primary-soft' : 'border-border bg-surface',
      )
    "
  >
    <UiCheckbox
      v-if="canConfirm"
      :model-value="allOnPage"
      :indeterminate="someOnPage"
      :disabled="disabled || !rowCount"
      :label="t('pendingReceipts.bulk.selectPage')"
      @update:model-value="emit('toggle-page', $event)"
    />

    <template v-if="selectedCount">
      <span class="text-sm font-medium text-foreground">
        {{ t('pendingReceipts.bulk.selected', { count: selectedCount }) }}
      </span>
      <span class="font-mono text-sm font-semibold text-primary">{{ formatSom(selectedAmount) }}</span>
      <UiButton size="sm" variant="ghost" :disabled="disabled" @click="emit('clear')">
        {{ t('pendingReceipts.bulk.clearSelection') }}
      </UiButton>
    </template>

    <div class="ms-auto flex flex-wrap gap-2">
      <UiButton
        v-if="canConfirm && selectedCount"
        size="sm"
        :disabled="disabled"
        @click="emit('confirm-selected')"
      >
        <UiIcon :icon="Check" :size="16" />
        {{ t('pendingReceipts.bulk.confirmSelected') }}
      </UiButton>
      <UiButton
        v-if="canConfirm && pendingTotal > 0"
        size="sm"
        variant="secondary"
        :disabled="disabled"
        @click="emit('confirm-all')"
      >
        <UiIcon :icon="CheckCheck" :size="16" />
        {{ t('pendingReceipts.bulk.confirmAllCount', { count: pendingTotal, amount: formatSom(pendingTotalAmount) }) }}
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiButton, UiCheckbox, UiIcon } from '@/shared/components'
import { Check, CheckCheck } from '@/shared/icons'
import { cn } from '@/shared/utils/cn'
import { formatSom } from '@/shared/utils/format-money'

const { t } = useI18n()

defineProps<{
  rowCount: number
  selectedCount: number
  selectedAmount: number
  allOnPage: boolean
  someOnPage: boolean
  /** Everything the filters match — not just this page. */
  pendingTotal: number
  pendingTotalAmount: number
  canConfirm?: boolean
  disabled?: boolean
}>()
const emit = defineEmits<{
  'toggle-page': [value: boolean]
  clear: []
  'confirm-selected': []
  'confirm-all': []
}>()
</script>
