<template>
  <PayDebtModal
    :open="pay.open.value"
    :amount="pay.amount.value"
    :payable-now="payableNow"
    :allocation="pay.allocation.value"
    :error="pay.error.value"
    :valid="pay.valid.value"
    :loading="pay.loading.value"
    v-model:method="pay.reception.method.value"
    v-model:paid-at="pay.reception.paidAt.value"
    v-model:comment="pay.reception.comment.value"
    @update:amount="pay.amount.value = $event"
    @close="pay.close"
    @confirm="emit('pay')"
  />

  <StudentTransferModal
    :state="transfer.state"
    :group-options="transfer.groupOptions.value"
    :total-debt="transfer.totalDebt.value"
    :total-overpaid="transfer.totalOverpaid.value"
    :valid="transfer.valid.value"
    @close="transfer.close"
    @confirm="transfer.submit"
  />

  <StudentFormModal
    v-model="card.editOpen.value"
    :editing="card.editing.value"
    :default-center-id="scope.centerIdForCreate"
    :loading="card.saving.value"
    @submit="card.saveEdit"
  />

  <StudentDeleteDialog
    :open="!!del.target.value" :name="del.name.value" :loading="del.deleting.value"
    @confirm="del.confirm" @cancel="del.cancel"
  />

  <!-- One receipt per month the payment covered — opens right after paying. -->
  <CheckModal :open="pay.checksOpen.value" :checks="pay.checks.value" @close="pay.closeChecks" />
</template>

<script setup lang="ts">
import { useScopeStore } from '@/stores/scope.store'
import CheckModal from '@/shared/components/receipt/CheckModal.vue'
import PayDebtModal from './PayDebtModal.vue'
import StudentTransferModal from '@/shared/components/transfer/StudentTransferModal.vue'
import StudentFormModal from '../StudentFormModal.vue'
import StudentDeleteDialog from '../StudentDeleteDialog.vue'
import type { useStudentCard } from '../../composables/use-student-card'
import type { usePayDebt } from '../../composables/use-pay-debt'
import type { useStudentDelete } from '../../composables/use-student-delete'
import type { useStudentTransfer } from '@/shared/composables/use-student-transfer'

defineProps<{
  card: ReturnType<typeof useStudentCard>
  pay: ReturnType<typeof usePayDebt>
  transfer: ReturnType<typeof useStudentTransfer>
  del: ReturnType<typeof useStudentDelete>
  payableNow: number
}>()
const emit = defineEmits<{ pay: [] }>()
// Edit form's center fallback — the header's active center.
const scope = useScopeStore()
</script>
