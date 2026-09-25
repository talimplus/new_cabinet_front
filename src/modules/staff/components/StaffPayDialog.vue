<template>
  <UiModal :model-value="open" :title="t('staff.salary.payTitle')" size="sm" @update:model-value="emit('close')">
    <div class="space-y-3">
      <dl class="space-y-1 rounded-md bg-surface-muted px-3 py-2 text-sm">
        <div class="flex justify-between gap-3">
          <dt class="text-muted-foreground">{{ t('staff.salary.net') }}</dt>
          <dd class="font-mono">{{ formatSom(net) }}</dd>
        </div>
        <div class="flex justify-between gap-3">
          <dt class="text-muted-foreground">{{ t('staff.salary.remaining') }}</dt>
          <dd class="font-mono font-semibold">{{ formatSom(remaining) }}</dd>
        </div>
      </dl>

      <UiInput
        :model-value="amount ?? ''"
        type="number"
        :label="t('staff.salary.payAmount')"
        :error="error || undefined"
        :disabled="loading"
        @update:model-value="emit('update:amount', $event === '' ? null : Number($event))"
      />
      <UiTextarea v-model="comment" :label="t('common.comment')" :rows="2" :disabled="loading" />
    </div>

    <template #footer>
      <UiButton variant="ghost" :disabled="loading" @click="emit('close')">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="loading" :disabled="!!error" @click="emit('confirm')">{{ t('common.save') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiModal, UiButton, UiInput, UiTextarea } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'

const { t } = useI18n()

defineProps<{
  open: boolean
  amount: number | null
  net: number
  remaining: number
  error?: string
  loading?: boolean
}>()
const emit = defineEmits<{ close: []; confirm: []; 'update:amount': [value: number | null] }>()

const comment = defineModel<string>('comment', { required: true })
</script>
