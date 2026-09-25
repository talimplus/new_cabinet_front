<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiInput, UiPagination, UiIcon } from '@/shared/components'
import { Search } from '@/shared/icons'
import { debounce } from '@/shared/utils/debounce'
import { usePermissions } from '@/shared/composables/use-permissions'
import { usePayments } from '../composables/use-payments'
import { PAYMENT_COLUMNS } from '../config/payment-columns'
import PaymentFilters from '../components/PaymentFilters.vue'
import PaymentMonthTabs from '../components/PaymentMonthTabs.vue'
import PaymentsTable from '../components/PaymentsTable.vue'
import PaymentExportControls from '../components/PaymentExportControls.vue'
import PaymentReceiptModals from '../components/PaymentReceiptModals.vue'
import MarkAsPaidDialog from '../components/MarkAsPaidDialog.vue'
import PartialPaymentModal from '../components/PartialPaymentModal.vue'

const { t } = useI18n()

const { canTakePayment, canExportPayments } = usePermissions()
const p = usePayments()
const { checks, exporter } = p
onMounted(p.init)

// Column labels are i18n keys in the config.
const columns = computed(() => PAYMENT_COLUMNS.map((c) => ({ ...c, label: t(c.label) })))
const onSearch = debounce((e: Event) => p.search((e.target as HTMLInputElement).value))
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <div class="min-w-0 flex-1 sm:max-w-xs">
        <UiInput type="search" :placeholder="t('common.searchPlaceholder')" @input="onSearch">
          <template #prefix><UiIcon :icon="Search" :size="16" /></template>
        </UiInput>
      </div>
      <PaymentExportControls v-if="canExportPayments" :exporter="exporter" />
    </div>

    <PaymentFilters
      v-model:year="p.filters.year"
      v-model:status="p.filters.status"
      v-model:group-id="p.filters.groupId"
      v-model:teacher-id="p.filters.teacherId"
      :group-options="p.groupOptions.value"
      :teacher-options="p.teacherOptions.value"
      @change="p.applyFilters"
      @teacher="p.setTeacher"
    />

    <PaymentMonthTabs :model-value="p.filters.month" :year="p.filters.year" @change="p.setMonth" />

    <PaymentsTable
      :columns="columns"
      :rows="p.rows.value"
      :loading="p.loading.value"
      :can-pay="canTakePayment"
      @mark-as-paid="p.openMarkAsPaid"
      @partial="p.openPartial"
      @history="checks.openHistory"
    />

    <UiPagination :page="p.filters.page" :total-pages="p.totalPages.value" @update:page="p.setPage" />

    <MarkAsPaidDialog
      :open="p.markDialog.open"
      :payment="p.markDialog.payment"
      :loading="p.markDialog.loading"
      @close="p.closeMarkAsPaid"
      @confirm="p.confirmMarkAsPaid"
    />
    <PartialPaymentModal
      :open="p.partial.open"
      :payment="p.partial.payment"
      :calculation="p.partial.calculation"
      :date="p.partial.plannedStudyUntilDate"
      :calculating="p.partial.calculating"
      :loading="p.partial.loading"
      @close="p.closePartial"
      @calculate="p.runCalculate"
      @clear="p.clearCalculation"
      @confirm="p.confirmPartial"
    />

    <PaymentReceiptModals :checks="checks" />
  </div>
</template>
