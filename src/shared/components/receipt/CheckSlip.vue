<template>
  <!--
    The `check-*` class names carry no styling here — they are the hooks the
    print iframe restyles (shared/utils/print-check.ts), so the printed slip is not at
    the mercy of the cabinet's theme.
  -->
  <div class="check mx-auto max-w-[340px]">
    <div class="check-header mb-3 border-b border-foreground pb-2 text-center">
      <div class="check-brand text-sm font-bold tracking-wide uppercase">{{ brand }}</div>
      <div class="check-no mt-1 font-mono text-[28px] leading-tight font-extrabold">
        {{ t('payments.check.number') }} {{ check.checkNo || '—' }}
      </div>
      <div
        v-if="check.status === ReceiptStatus.PENDING"
        class="check-pending mt-1.5 text-xs font-bold text-warning"
      >
        {{ t('payments.check.pending') }}
      </div>
    </div>

    <table class="check-table w-full border-collapse text-[13px]">
      <tbody>
        <tr v-for="row in rows" :key="row.label" class="border-b border-dotted border-border last:border-0">
          <td class="k py-1.5 pr-3 align-top whitespace-nowrap text-muted-foreground">
            {{ row.label }}
          </td>
          <td class="v py-1.5 text-right align-top font-semibold">{{ row.value }}</td>
        </tr>
      </tbody>
    </table>

    <div class="check-total mt-3 flex items-baseline justify-between gap-3 border-t border-foreground pt-2">
      <span class="check-total-label text-[13px] font-bold uppercase">
        {{ t('payments.check.amount') }}
      </span>
      <span class="check-total-value font-mono text-lg font-extrabold whitespace-nowrap">
        {{ formatSom(check.amount) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatSom } from '@/shared/utils/format-money'
import { formatDateTime } from '@/shared/utils/format-date'
import { PAYMENT_METHOD_LABEL_KEYS } from '@/shared/enums/payment-method.enum'
import { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import type { PaymentCheck } from '@/shared/interfaces/payment-check.interface'

const { t } = useI18n()

const props = defineProps<{ check: PaymentCheck; brandName?: string }>()

const brand = computed(() => props.brandName || t('payments.check.title'))

const rows = computed(() => {
  const c = props.check
  const method = c.paymentMethod ? t(PAYMENT_METHOD_LABEL_KEYS[c.paymentMethod]) : '—'
  const paid = c.paidAt ? ` · ${t('payments.check.paidAtLabel')}: ${c.paidAt}` : ''
  return [
    { label: t('payments.check.fullName'), value: c.student?.fullName || '—' },
    { label: t('payments.check.phone'), value: c.student?.phone || '—' },
    { label: t('payments.check.group'), value: c.group?.name || '—' },
    { label: t('payments.check.teacher'), value: c.teacher?.fullName || '—' },
    { label: t('payments.check.month'), value: c.forMonth || '—' },
    { label: t('payments.check.paymentMethod'), value: `${method}${paid}` },
    { label: t('payments.check.balanceBefore'), value: formatSom(c.balanceBefore) },
    { label: t('payments.check.balanceAfter'), value: formatSom(c.balanceAfter) },
    { label: t('payments.check.dateTime'), value: formatDateTime(c.receivedAt ?? c.createdAt) },
    { label: t('payments.check.receivedBy'), value: c.receivedBy?.fullName || '—' },
    ...(c.transactionNo
      ? [{ label: t('payments.check.transactionNo'), value: c.transactionNo }]
      : []),
  ]
})
</script>
