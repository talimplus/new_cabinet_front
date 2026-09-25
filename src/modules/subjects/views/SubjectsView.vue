<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GenericObject } from 'vee-validate'
import { UiButton, UiInput, UiTable, UiPagination, UiIconButton, UiIcon } from '@/shared/components'
import { Plus, Pencil, Trash2 } from '@/shared/icons'
import { debounce } from '@/shared/utils/debounce'
import { usePermissions } from '@/shared/composables/use-permissions'
import SubjectFormModal from '../components/SubjectFormModal.vue'
import { useSubjects } from '../composables/use-subjects'
import type { Subject } from '../interfaces/subject.interface'

const { t } = useI18n()

const {
  scope, rows, totalPages, loading, filters, modalOpen, editing,
  init, search, setPage, openCreate, openEdit, submit, remove,
} = useSubjects()
onMounted(init)

const { canManageSubjects } = usePermissions()
const modalRef = ref<{ setBackendErrors: (e: unknown) => void } | null>(null)
const saving = ref(false)
const columns = computed(() => [
  { key: 'center', label: t('common.center') },
  { key: 'name', label: t('subjects.subjectName') },
])
const onSearch = debounce((e: Event) => search((e.target as HTMLInputElement).value))

async function onSubmit(values: GenericObject) {
  saving.value = true
  try {
    await submit({ name: values.name as string, centerId: values.centerId as number })
  } catch (error) {
    modalRef.value?.setBackendErrors(error)
  } finally {
    saving.value = false
  }
}
async function onDelete(subject: Subject) {
  if (confirm(t('common.confirmDeleteNamed', { name: subject.name }))) await remove(subject)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-1 flex-wrap gap-3">
        <div class="w-full max-w-xs">
          <UiInput :placeholder="t('common.searchPlaceholder')" @input="onSearch" />
        </div>
      </div>
      <UiButton v-if="canManageSubjects" @click="openCreate"
        ><UiIcon :icon="Plus" :size="16" /> {{ t('common.create') }}</UiButton
      >
    </div>

    <UiTable :columns="columns" :rows="rows" :loading="loading" :empty-text="t('subjects.empty')">
      <template #cell-center="{ row }">{{ (row as Subject).center?.name ?? '—' }}</template>
      <template #actions="{ row }">
        <div v-if="canManageSubjects" class="flex justify-end gap-1">
          <UiIconButton
            :icon="Pencil"
            tone="primary"
            :label="t('common.edit')"
            @click="openEdit(row as Subject)"
          />
          <UiIconButton
            :icon="Trash2"
            tone="danger"
            :label="t('common.delete')"
            @click="onDelete(row as Subject)"
          />
        </div>
      </template>
    </UiTable>

    <UiPagination :page="filters.page" :total-pages="totalPages" @update:page="setPage" />

    <SubjectFormModal
      ref="modalRef"
      v-model="modalOpen"
      :editing="editing"
      :default-center-id="scope.centerIdForCreate"
      :loading="saving"
      @submit="onSubmit"
    />
  </div>
</template>
