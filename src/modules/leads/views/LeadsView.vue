<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { UiButton, UiSelect, UiPagination, UiIcon } from '@/shared/components'
import { Plus } from '@/shared/icons'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useLeads } from '../composables/use-leads'
import LeadFilters from '../components/LeadFilters.vue'
import LeadsTable from '../components/LeadsTable.vue'
import LeadFormModal from '../components/LeadFormModal.vue'
import LeadDiscardDialog from '../components/LeadDiscardDialog.vue'
import type { Lead } from '../interfaces/lead.interface'
import type { LeadForm } from '../interfaces/lead-form.interface'
import type { LeadTransferForm } from '../interfaces/lead-transfer-form.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { canCreateLead, canEditLead, canDeleteLead } = usePermissions()
const l = useLeads()
onMounted(l.init)


const modalRef = ref<{ setBackendErrors: (e: unknown) => void } | null>(null)
const saving = ref(false)
const transferring = ref(false)

function onDelete(lead: Lead) {
  l.remove(lead.id)
}
async function onSubmit(payload: LeadForm) {
  saving.value = true
  try {
    await l.submit(payload)
  } catch (error) {
    modalRef.value?.setBackendErrors(error)
  } finally {
    saving.value = false
  }
}
async function onTransfer(payload: LeadTransferForm) {
  transferring.value = true
  try {
    await l.transferToStudent(payload)
  } catch (error) {
    modalRef.value?.setBackendErrors(error)
  } finally {
    transferring.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <UiButton v-if="canCreateLead" class="ml-auto" @click="l.openCreate">
        <UiIcon :icon="Plus" :size="16" /> {{ t('common.add') }}
      </UiButton>
    </div>

    <LeadFilters :filters="l.filters" :group-options="l.groupOptions.value" @change="l.applyFilters" />

    <LeadsTable
      :rows="l.rows.value"
      :loading="l.loading.value"
      :can-edit="canEditLead"
      :can-delete="canDeleteLead"
      @edit="l.openEdit"
      @delete="onDelete"
      @status-change="l.requestStatus"
    />

    <UiPagination :page="l.filters.page" :total-pages="l.totalPages.value" @update:page="l.setPage" />

    <LeadFormModal
      ref="modalRef"
      v-model="l.modalOpen.value"
      :editing="l.editing.value"
      :default-center-id="l.scope.centerIdForCreate"
      :loading="saving"
      :transferring="transferring"
      @submit="onSubmit"
      @transfer="onTransfer"
    />
    <LeadDiscardDialog v-model="l.discardDialog.open" @confirm="l.confirmDiscard" />
  </div>
</template>
