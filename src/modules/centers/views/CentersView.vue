<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiInput, UiTable, UiPagination, UiIconButton, UiIcon } from '@/shared/components'
import { usePermissions } from '@/shared/composables/use-permissions'
import { Plus, Pencil, Trash2, Check } from '@/shared/icons'
import { debounce } from '@/shared/utils/debounce'
import CenterFormModal from '../components/CenterFormModal.vue'
import { useCenters } from '../composables/use-centers'
import type { Center } from '../interfaces/center.interface'
import type { CenterForm } from '../interfaces/center-form.interface'

const { t } = useI18n()

const {
  rows,
  totalPages,
  loading,
  params,
  modalOpen,
  editing,
  load,
  search,
  setPage,
  openCreate,
  openEdit,
  submit,
  remove,
} = useCenters()
onMounted(load)

const { canManageCenters } = usePermissions()
const modalRef = ref<{ setBackendErrors: (e: unknown) => void } | null>(null)
const saving = ref(false)
const columns = computed(() => [
  { key: 'name', label: t('centers.table.name') },
  { key: 'isDefault', label: t('centers.table.default') },
])
const onSearch = debounce((e: Event) => search((e.target as HTMLInputElement).value))

async function onSubmit(payload: CenterForm) {
  saving.value = true
  try {
    await submit(payload)
  } catch (error) {
    modalRef.value?.setBackendErrors(error)
  } finally {
    saving.value = false
  }
}
async function onDelete(center: Center) {
  if (confirm(t('common.confirmDeleteNamed', { name: center.name }))) await remove(center)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="w-full max-w-xs">
        <UiInput :placeholder="t('common.searchPlaceholder')" @input="onSearch" />
      </div>
      <UiButton v-if="canManageCenters" @click="openCreate"
        ><UiIcon :icon="Plus" :size="16" /> {{ t('common.create') }}</UiButton
      >
    </div>

    <UiTable :columns="columns" :rows="rows" :loading="loading">
      <template #cell-isDefault="{ value }">
        <UiIcon v-if="value" :icon="Check" :size="18" class="text-success" />
        <span v-else class="text-muted-foreground">—</span>
      </template>
      <template #actions="{ row }">
        <div v-if="canManageCenters" class="flex justify-end gap-1">
          <UiIconButton
            :icon="Pencil"
            tone="primary"
            :label="t('common.edit')"
            @click="openEdit(row as Center)"
          />
          <UiIconButton
            :icon="Trash2"
            tone="danger"
            :label="t('common.delete')"
            @click="onDelete(row as Center)"
          />
        </div>
      </template>
    </UiTable>

    <UiPagination :page="params.page ?? 1" :total-pages="totalPages" @update:page="setPage" />

    <CenterFormModal
      ref="modalRef"
      v-model="modalOpen"
      :editing="editing"
      :loading="saving"
      @submit="onSubmit"
    />
  </div>
</template>
