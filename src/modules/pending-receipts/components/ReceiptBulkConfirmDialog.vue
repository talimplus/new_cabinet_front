<template>
  <UiModal
    :model-value="modelValue"
    :title="isAll ? t('pendingReceipts.bulk.allTitle') : t('pendingReceipts.bulk.selectedTitle')"
    size="sm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-3 text-sm">
      <p class="text-foreground">{{ question }}</p>

      <!-- Without a date filter "all" really does mean everything ever taken. -->
      <p
        v-if="isAll && !hasFilters"
        class="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning"
      >
        {{ t('pendingReceipts.bulk.allNoFilterWarning') }}
      </p>
    </div>

    <template #footer>
      <UiButton variant="outline" :disabled="loading" @click="emit('update:modelValue', false)">
        {{ t('common.cancel') }}
      </UiButton>
      <UiButton :loading="loading" @click="emit('confirm')">
        <UiIcon :icon="CheckCheck" :size="16" />
        {{ t('pendingReceipts.approve') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiButton, UiIcon } from '@/shared/components'
import { CheckCheck } from '@/shared/icons'
import { formatSom } from '@/shared/utils/format-money'
import { BulkConfirmMode } from '../enums/bulk-confirm-mode.enum'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  mode: BulkConfirmMode
  selectedCount: number
  selectedAmount: number
  pendingTotal: number
  pendingTotalAmount: number
  hasFilters?: boolean
  loading?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; confirm: [] }>()

const isAll = computed(() => props.mode === BulkConfirmMode.ALL)

const question = computed(() =>
  isAll.value
    ? t('pendingReceipts.bulk.allQuestion', {
        count: props.pendingTotal,
        amount: formatSom(props.pendingTotalAmount),
      })
    : t('pendingReceipts.bulk.selectedQuestion', {
        count: props.selectedCount,
        amount: formatSom(props.selectedAmount),
      }),
)
</script>
