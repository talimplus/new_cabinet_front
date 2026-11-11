<template>
  <div class="flex items-center justify-end gap-2">
    <UiButton v-if="canPay && staff.status !== PayrollStatus.PAID" size="sm" @click="emit('pay', staff)">
      {{ t('payroll.pay') }}
    </UiButton>
    <span v-else-if="staff.status === PayrollStatus.PAID" class="text-xs text-muted-foreground">
      {{ t('payroll.paid') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/shared/components'
import { PayrollStatus } from '../enums/payroll-status.enum'
import type { StaffSalary } from '../interfaces/staff-salary.interface'

const { t } = useI18n()

/** Opening the staff page is the row click now (PayrollTable). */
defineProps<{ staff: StaffSalary; canPay?: boolean }>()
const emit = defineEmits<{ pay: [staff: StaffSalary] }>()
</script>
