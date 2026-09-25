<template>
  <UiModal
    :model-value="open"
    :title="t('payments.check.modalTitle')"
    size="sm"
    @update:model-value="emit('close')"
  >
    <div ref="area" class="space-y-6">
      <CheckSlip
        v-for="(check, i) in checks"
        :key="`${check.receiptId ?? check.checkNo}-${i}`"
        :check="check"
      />
    </div>

    <template #footer>
      <UiButton variant="ghost" @click="emit('close')">{{ t('payments.check.close') }}</UiButton>
      <UiButton :disabled="!checks.length" @click="print">
        <UiIcon :icon="Printer" :size="16" />
        {{ t('payments.check.print') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import UiModal from '../UiModal.vue'
import UiButton from '../UiButton.vue'
import UiIcon from '../UiIcon.vue'
import { Printer } from '@/shared/icons'
import { printCheckArea } from '@/shared/utils/print-check'
import CheckSlip from './CheckSlip.vue'
import type { PaymentCheck } from '@/shared/interfaces/payment-check.interface'

const { t } = useI18n()

defineProps<{ open: boolean; checks: PaymentCheck[] }>()
const emit = defineEmits<{ close: [] }>()

const area = ref<HTMLElement | null>(null)

function print(): void {
  printCheckArea(area.value, t('payments.check.title'))
}
</script>
