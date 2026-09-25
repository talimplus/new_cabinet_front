<script setup lang="ts">
import { onMounted } from 'vue'
import { UiPagination } from '@/shared/components'
import { usePermissions } from '@/shared/composables/use-permissions'
import { usePendingReceipts } from '../composables/use-pending-receipts'
import { BulkConfirmMode } from '../enums/bulk-confirm-mode.enum'
import ReceiptStatsCards from '../components/ReceiptStatsCards.vue'
import ReceiptFilters from '../components/ReceiptFilters.vue'
import ReceiptToolbar from '../components/ReceiptToolbar.vue'
import PendingReceiptsTable from '../components/PendingReceiptsTable.vue'
import ReceiptConfirmDialog from '../components/ReceiptConfirmDialog.vue'
import ReceiptRejectDialog from '../components/ReceiptRejectDialog.vue'
import ReceiptBulkConfirmDialog from '../components/ReceiptBulkConfirmDialog.vue'

const { canConfirmReceipt, canRejectReceipt } = usePermissions()
const r = usePendingReceipts()
const { selection } = r
onMounted(r.init)
</script>

<template>
  <div class="space-y-4">
    <ReceiptStatsCards :stats="r.stats.value" :loading="r.statsLoading.value" />

    <ReceiptFilters
      v-model:date-from="r.filters.dateFrom"
      v-model:date-to="r.filters.dateTo"
      :has-filters="r.hasFilters.value"
      :disabled="r.processing.value"
      @change="r.applyFilters"
      @reset="r.resetFilters"
    />

    <ReceiptToolbar
      :row-count="r.rows.value.length"
      :selected-count="selection.count.value"
      :selected-amount="selection.amount.value"
      :all-on-page="selection.allOnPage.value"
      :some-on-page="selection.someOnPage.value"
      :pending-total="r.pendingTotal.value"
      :pending-total-amount="r.pendingTotalAmount.value"
      :can-confirm="canConfirmReceipt"
      :disabled="r.processing.value"
      @toggle-page="selection.togglePage"
      @clear="selection.clear"
      @confirm-selected="r.openBulk(BulkConfirmMode.SELECTED)"
      @confirm-all="r.openBulk(BulkConfirmMode.ALL)"
    />

    <PendingReceiptsTable
      :rows="r.rows.value"
      :is-selected="selection.isSelected"
      :loading="r.loading.value"
      :processing="r.processing.value"
      :has-filters="r.hasFilters.value"
      :can-confirm="canConfirmReceipt"
      :can-reject="canRejectReceipt"
      @toggle="selection.toggle"
      @confirm="r.openConfirm"
      @reject="r.openReject"
    />

    <UiPagination :page="r.filters.page" :total-pages="r.totalPages.value" @update:page="r.setPage" />

    <ReceiptConfirmDialog
      v-model="r.confirmDialog.open"
      :receipt="r.confirmDialog.receipt"
      :loading="r.processing.value"
      @confirm="r.confirm"
    />
    <ReceiptRejectDialog
      v-model="r.rejectDialog.open"
      v-model:reason="r.rejectReason.value"
      :receipt="r.rejectDialog.receipt"
      :loading="r.processing.value"
      @reject="r.reject"
    />
    <ReceiptBulkConfirmDialog
      v-model="r.bulkDialog.open"
      :mode="r.bulkDialog.mode"
      :selected-count="selection.count.value"
      :selected-amount="selection.amount.value"
      :pending-total="r.pendingTotal.value"
      :pending-total-amount="r.pendingTotalAmount.value"
      :has-filters="r.hasFilters.value"
      :loading="r.processing.value"
      @confirm="r.confirmBulk"
    />
  </div>
</template>
