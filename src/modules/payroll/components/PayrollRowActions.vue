<template>
  <div class="flex items-center justify-end gap-2">
    <!-- Vaqtincha: xodimlar qator bosilishiga o'rgangach Eye olib tashlanadi. -->
    <UiIconButton
      v-if="canViewStaff"
      :icon="Eye"
      :label="t('staff.viewAction')"
      @click="emit('open-staff', staff)"
    />
    <template v-if="canPay">
      <UiIconButton :icon="HandCoins" tone="primary" :label="t('payroll.actions.advance')" @click="emit('advance', staff)" />
      <UiIconButton :icon="Gift" tone="success" :label="t('payroll.actions.bonus')" @click="emit('bonus', staff)" />
    </template>
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
import { Eye, HandCoins, Gift } from '@/shared/icons'
import { PayrollStatus } from '../enums/payroll-status.enum'
import type { StaffSalary } from '../interfaces/staff-salary.interface'

const { t } = useI18n()

/**
 * The staff page opens from the eye button and from the row click (PayrollTable).
 * Advance / bonus are offered even on a paid row — they land on a later salary.
 */
defineProps<{ staff: StaffSalary; canPay?: boolean; canViewStaff?: boolean }>()
const emit = defineEmits<{
  pay: [staff: StaffSalary]
  'open-staff': [staff: StaffSalary]
  advance: [staff: StaffSalary]
  bonus: [staff: StaffSalary]
}>()
</script>
