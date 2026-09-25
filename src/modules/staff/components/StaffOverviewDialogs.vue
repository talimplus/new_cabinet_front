<template>
  <StaffPayDialog
    :open="s.pay.open"
    :amount="s.pay.amount"
    :net="s.salary.value?.netSalary ?? 0"
    :remaining="s.salary.value?.remaining ?? 0"
    :error="s.payError.value"
    :loading="s.submitting.value"
    v-model:comment="s.pay.comment"
    @update:amount="s.pay.amount = $event"
    @close="s.pay.open = false"
    @confirm="emit('pay')"
  />

  <StaffDeductionDialog
    :open="s.deduction.open"
    :amount="s.deduction.amount"
    :valid="s.deductionValid.value"
    :loading="s.submitting.value"
    v-model:type="s.deduction.type"
    v-model:reason="s.deduction.reason"
    @update:amount="s.deduction.amount = $event"
    @close="s.deduction.open = false"
    @confirm="emit('deduct')"
  />
</template>

<script setup lang="ts">
import StaffPayDialog from './StaffPayDialog.vue'
import StaffDeductionDialog from './StaffDeductionDialog.vue'
import type { useStaffOverview } from '../composables/use-staff-overview'

/** Both write dialogs of the staff card, bound to the composable's state. */
defineProps<{ s: ReturnType<typeof useStaffOverview> }>()
const emit = defineEmits<{ pay: []; deduct: [] }>()
</script>
