<template>
  <div class="space-y-3">
    <UiSelect
      v-model="method"
      :options="methodOptions"
      :label="t('payments.reception.paymentMethod')"
      :searchable="false"
      :clearable="false"
      :disabled="disabled"
    />
    <!-- A card payment is settled on its own date, which may differ from today. -->
    <UiDatepicker
      v-if="method === PaymentMethod.CARD"
      v-model="paidAt"
      :label="t('payments.reception.paidAt')"
      :placeholder="t('payments.dialog.selectDate')"
      :disabled="disabled"
    />
    <UiTextarea
      v-model="comment"
      :label="t('payments.reception.comment')"
      :rows="2"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UiSelect from '../UiSelect.vue'
import UiTextarea from '../UiTextarea.vue'
import UiDatepicker from '../UiDatepicker.vue'
import { PaymentMethod, PAYMENT_METHOD_LABEL_KEYS } from '@/shared/enums/payment-method.enum'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const { t } = useI18n()

defineProps<{ disabled?: boolean }>()

const method = defineModel<PaymentMethod>('method', { default: PaymentMethod.CASH })
const paidAt = defineModel<Date | null>('paidAt', { default: null })
const comment = defineModel<string>('comment', { default: '' })

const methodOptions = computed<SelectOption[]>(() =>
  Object.values(PaymentMethod).map((value) => ({
    label: t(PAYMENT_METHOD_LABEL_KEYS[value]),
    value,
  })),
)
</script>
