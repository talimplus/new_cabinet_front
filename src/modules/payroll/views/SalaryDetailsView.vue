<template>
  <div class="mx-auto max-w-4xl space-y-4">
    <div class="flex items-center gap-3">
      <UiBackButton :fallback="{ name: 'payroll' }" />
      <div class="min-w-0 flex-1">
        <h1 class="truncate text-lg font-bold text-foreground">{{ heading }}</h1>
        <p class="text-sm text-muted-foreground">{{ t('payroll.details.title') }} · {{ monthLabel }}</p>
      </div>
    </div>

    <div v-if="d.loading.value && !d.details.value" class="p-8 text-center">
      <UiSpinner :size="24" class="mx-auto text-muted-foreground" />
    </div>
    <p v-else-if="d.failed.value" class="p-8 text-center text-sm text-muted-foreground">
      {{ t('payroll.details.notFound') }}
    </p>
    <template v-else-if="d.details.value">
      <p v-if="d.details.value.monthOpen" class="rounded-md bg-info-soft px-3 py-2 text-sm text-info">
        {{ t('payroll.details.open', { month: monthName(month) }) }}
      </p>
      <p v-else-if="d.details.value.closed" class="rounded-md bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
        {{ t('payroll.details.closed') }}
      </p>
      <SalaryCommissionStep :details="d.details.value" />
      <SalaryTransfersStep :details="d.details.value" />
      <SalaryExtrasStep :details="d.details.value" />
      <SalaryAdvancesStep :details="d.details.value" :can-pay="canPaySalary" @carry="askCarry" />
      <SalaryPaymentsStep :details="d.details.value" />
      <SalaryReceipt :details="d.details.value" />
    </template>
    <UiConfirmDialog
      :model-value="carry.state.open" :title="t('payroll.carry.title')" :message="carry.message.value"
      :loading="carry.state.loading" @update:model-value="carry.state.open = $event" @confirm="carry.confirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { UiBackButton, UiSpinner } from '@/shared/components'
import { useSalaryDetails } from '../composables/use-salary-details'
import { monthName } from '../utils/payroll-salary'
import SalaryCommissionStep from '../components/details/SalaryCommissionStep.vue'
import SalaryTransfersStep from '../components/details/SalaryTransfersStep.vue'
import SalaryExtrasStep from '../components/details/SalaryExtrasStep.vue'
import SalaryAdvancesStep from '../components/details/SalaryAdvancesStep.vue'
import SalaryPaymentsStep from '../components/details/SalaryPaymentsStep.vue'
import SalaryReceipt from '../components/details/SalaryReceipt.vue'
import { UiConfirmDialog } from '@/shared/components'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useAdvanceCarry } from '../composables/use-advance-carry'

const { t } = useI18n()
const route = useRoute()

/** `/payroll/:userId/:month` — month is "YYYY-MM". */
const userId = computed(() => Number(route.params.userId))
const month = computed(() => String(route.params.month))
const d = useSalaryDetails(() => userId.value, () => month.value)
onMounted(d.load)
const { canPaySalary } = usePermissions()
const carry = useAdvanceCarry(d.load)
const askCarry = () =>
  carry.ask({ userId: userId.value, forMonth: month.value, over: d.details.value?.totals.over ?? 0 })

const monthLabel = computed(() => `${monthName(month.value)} ${month.value.slice(0, 4)}`)
const heading = computed(() => {
  const u = d.details.value?.user
  return u ? `${u.firstName} ${u.lastName}` : t('payroll.details.title')
})
</script>
