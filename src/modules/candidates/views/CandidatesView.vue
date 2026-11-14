<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { GenericObject } from 'vee-validate'
import { UiPagination } from '@/shared/components'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useCandidates } from '../composables/use-candidates'
import { useCandidateHire } from '../composables/use-candidate-hire'
import { toCandidateForm } from '../composables/use-candidate-schema'
import CandidatesToolbar from '../components/CandidatesToolbar.vue'
import CandidatesTable from '../components/CandidatesTable.vue'
import CandidateFormModal from '../components/CandidateFormModal.vue'
import CandidateDeleteDialog from '../components/CandidateDeleteDialog.vue'
import CandidateHireAskDialog from '../components/CandidateHireAskDialog.vue'
import CandidateHireModal from '../components/CandidateHireModal.vue'

const router = useRouter()

const { canManageCandidates } = usePermissions()
const c = useCandidates()
const h = useCandidateHire(() => c.load())
onMounted(c.init)

const modalRef = ref<{ setBackendErrors: (err: unknown) => void } | null>(null)
const saving = ref(false)
const rowOffset = computed(() => (c.filters.page - 1) * c.filters.perPage)
const deleteOpen = computed({
  get: () => c.deleteTarget.value !== null,
  set: (v: boolean) => { if (!v) c.cancelDelete() },
})
const deleteName = computed(() => {
  const d = c.deleteTarget.value
  return d ? `${d.lastName} ${d.firstName}` : ''
})

async function onSubmit(values: GenericObject) {
  saving.value = true
  try {
    await c.submit(toCandidateForm(values))
  } catch (error) {
    modalRef.value?.setBackendErrors(error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <CandidatesToolbar :c="c" :can-manage="canManageCandidates" />

    <CandidatesTable
      :rows="c.rows.value"
      :loading="c.loading.value"
      :row-offset="rowOffset"
      :can-manage="canManageCandidates"
      :changing-id="h.state.changingId"
      @view="(row) => router.push({ name: 'candidate-detail', params: { id: row.id } })"
      @edit="c.openEdit"
      @delete="c.requestDelete"
      @status="h.changeStatus"
    />

    <UiPagination :page="c.filters.page" :total-pages="c.totalPages.value" @update:page="c.setPage" />

    <CandidateFormModal
      ref="modalRef"
      v-model="c.modalOpen.value"
      :editing="c.editing.value"
      :default-center-id="c.scope.centerIdForCreate"
      :subjects="c.subjects.value"
      :loading="saving"
      @submit="onSubmit"
    />
    <CandidateDeleteDialog v-model="deleteOpen" :name="deleteName" :loading="c.deleting.value" @confirm="c.confirmDelete" />
    <CandidateHireAskDialog :candidate="h.state.askTarget" @yes="h.askYes" @no="h.askNo" @cancel="h.state.askTarget = null" />
    <CandidateHireModal :h="h" />
  </div>
</template>
