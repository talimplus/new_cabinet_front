<template>
  <div class="space-y-1.5 rounded-md bg-surface-muted px-3 py-2">
    <PaymentInfoRow v-if="withStudent" :label="t('payments.dialog.student')" :value="studentName" />
    <PaymentInfoRow :label="t('payments.dialog.lessonsBillable')" :value="lessons" />
    <!-- Only the student-summary endpoint fills these; the list leaves them out. -->
    <PaymentInfoRow
      v-if="payment?.perLessonAmount != null"
      :label="t('payments.exclusion.perLesson')"
      :value="formatSom(payment.perLessonAmount)"
    />
    <PaymentInfoRow
      v-if="withFullAmount && payment?.fullAmount != null"
      :label="t('payments.exclusion.fullAmount')"
      :value="formatSom(payment.fullAmount)"
    />
    <PaymentInfoRow :label="t('payments.dialog.remainingSum')" strong>
      <span class="text-primary">{{ formatSom(payable) }}</span>
    </PaymentInfoRow>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatSom } from '@/shared/utils/format-money'
import PaymentInfoRow from './PaymentInfoRow.vue'
import type { Payment } from '../interfaces/payment.interface'

const { t } = useI18n()

const props = defineProps<{
  payment: Payment | null
  /** Collectable now, already reduced by a pending write-off. */
  payable: number
  withStudent?: boolean
  withFullAmount?: boolean
}>()

const studentName = computed(() =>
  props.payment ? `${props.payment.student.firstName} ${props.payment.student.lastName}` : '—',
)
const lessons = computed(() =>
  props.payment ? `${props.payment.lessonsBillable} / ${props.payment.lessonsPlanned}` : '—',
)
</script>
