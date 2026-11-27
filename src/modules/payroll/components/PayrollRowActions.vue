<template>
  <div class="flex items-center justify-end gap-2">
    <UiIconButton :icon="Eye" :label="t('payroll.actions.details')" @click="emit('details', staff)" />
    <UiIconButton v-if="canViewStaff" :icon="User" :label="t('payroll.actions.staff')" @click="emit('open-staff', staff)" />
    <template v-if="canPay">
      <UiIconButton :icon="HandCoins" tone="primary" :label="t('payroll.actions.advance')" @click="emit('advance', staff)" />
      <UiIconButton :icon="Gift" tone="success" :label="t('payroll.actions.bonus')" @click="emit('bonus', staff)" />
    </template>
    <UiButton v-if="canPay && owed" size="sm" @click="emit('pay', staff)">
      {{ t('payroll.pay') }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiIconButton } from '@/shared/components'
import { Eye, HandCoins, Gift, User } from '@/shared/icons'
import { getRemaining } from '../utils/payroll-salary'
import type { StaffSalary } from '../interfaces/staff-salary.interface'

const { t } = useI18n()

/**
 * Eye (and the row click) opens the salary breakdown; the person icon opens
 * the staff page. "Pay" is offered while something is still to be handed over.
 * Advance / bonus are offered even on a settled row — they land on a later salary.
 */
const props = defineProps<{ staff: StaffSalary; canPay?: boolean; canViewStaff?: boolean }>()
const emit = defineEmits<{
  pay: [staff: StaffSalary]
  details: [staff: StaffSalary]
  'open-staff': [staff: StaffSalary]
  advance: [staff: StaffSalary]
  bonus: [staff: StaffSalary]
}>()

const owed = computed(() => getRemaining(props.staff) > 0)
</script>
