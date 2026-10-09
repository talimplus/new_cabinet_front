<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GenericObject } from 'vee-validate'
import { UiButton, UiInput, UiSelect, UiPagination, UiIcon } from '@/shared/components'
import { Plus, Search } from '@/shared/icons'
import { debounce } from '@/shared/utils/debounce'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useCandidates } from '../composables/use-candidates'
import { toCandidateForm } from '../composables/use-candidate-schema'
import CandidatesTable from '../components/CandidatesTable.vue'
import CandidateFormModal from '../components/CandidateFormModal.vue'
import CandidateDeleteDialog from '../components/CandidateDeleteDialog.vue'

const { t } = useI18n()

const { canManageCandidates } = usePermissions()
const c = useCandidates()
onMounted(c.init)

const modalRef = ref<{ setBackendErrors: (err: unknown) => void } | null>(null)
const saving = ref(false)
const onSearch = debounce((ev: Event) => c.search((ev.target as HTMLInputElement).value))
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
    <div class="flex flex-wrap items-center gap-3">
      <div class="min-w-0 flex-1 sm:max-w-xs">
        <UiInput type="search" :placeholder="t('candidates.searchPlaceholder')" @input="onSearch">
          <template #prefix><UiIcon :icon="Search" :size="16" /></template>
        </UiInput>
      </div>
      <div class="w-full sm:w-56">
        <UiSelect
          :model-value="c.filters.subjectId"
          :options="c.subjects.value"
          :placeholder="t('candidates.allSubjects')"
          clearable
          @update:model-value="c.setSubject(($event as number | null) ?? null)"
        />
      </div>
      <span class="text-sm text-muted-foreground">{{ t('candidates.total', { count: c.total.value }) }}</span>
      <UiButton v-if="canManageCandidates" class="ml-auto" @click="c.openCreate">
        <UiIcon :icon="Plus" :size="16" /> {{ t('common.add') }}
      </UiButton>
    </div>

    <CandidatesTable
      :rows="c.rows.value"
      :loading="c.loading.value"
      :row-offset="rowOffset"
      :can-manage="canManageCandidates"
      @edit="c.openEdit"
      @delete="c.requestDelete"
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
  </div>
</template>
