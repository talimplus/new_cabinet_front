<template>
  <div class="flex items-center justify-end gap-2">
    <UiIconButton
      v-if="canViewStaff"
      :icon="Eye"
      :label="t('staff.viewAction')"
      @click="emit('open-staff', staff)"
    />
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
import { UiButton, UiIconButton } from '@/shared/components'
import { Eye } from '@/shared/icons'
import { PayrollStatus } from '../enums/payroll-status.enum'
import type { StaffSalary } from '../interfaces/staff-salary.interface'

const { t } = useI18n()

defineProps<{ staff: StaffSalary; canPay?: boolean; canViewStaff?: boolean }>()
const emit = defineEmits<{ pay: [staff: StaffSalary]; 'open-staff': [staff: StaffSalary] }>()
</script>
