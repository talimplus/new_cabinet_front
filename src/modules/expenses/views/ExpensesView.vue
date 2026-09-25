<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GenericObject } from 'vee-validate'
import { UiButton, UiSelect, UiInput, UiPagination, UiIcon } from '@/shared/components'
import { Plus, Search } from '@/shared/icons'
import { debounce } from '@/shared/utils/debounce'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useExpenses } from '../composables/use-expenses'
import ExpenseMonthFilter from '../components/ExpenseMonthFilter.vue'
import ExpensesTable from '../components/ExpensesTable.vue'
import ExpenseFormModal from '../components/ExpenseFormModal.vue'
import ExpenseDeleteDialog from '../components/ExpenseDeleteDialog.vue'

const { t } = useI18n()

const { canCreateExpense, canEditExpense, canDeleteExpense } = usePermissions()
const e = useExpenses()
onMounted(e.init)

const modalRef = ref<{ setBackendErrors: (err: unknown) => void } | null>(null)
const saving = ref(false)
const onSearch = debounce((ev: Event) => e.search((ev.target as HTMLInputElement).value))
const deleteOpen = computed({
  get: () => e.deleteTarget.value !== null,
  set: (v: boolean) => { if (!v) e.cancelDelete() },
})

async function onSubmit(values: GenericObject) {
  saving.value = true
  try {
    await e.submit({
      centerId: values.centerId as number,
      name: values.name as string,
      amount: values.amount as number,
      description: (values.description as string) ?? '',
      forMonth: values.forMonth as string,
    })
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
        <UiInput type="search" :placeholder="t('expenses.searchPlaceholder')" @input="onSearch">
          <template #prefix><UiIcon :icon="Search" :size="16" /></template>
        </UiInput>
      </div>
      <UiButton v-if="canCreateExpense" class="ml-auto" @click="e.openCreate">
        <UiIcon :icon="Plus" :size="16" /> {{ t('common.add') }}
      </UiButton>
    </div>

    <ExpenseMonthFilter :model-value="e.filters.forMonth" @update:model-value="e.setMonth" />

    <ExpensesTable
      :rows="e.rows.value"
      :loading="e.loading.value"
      :can-edit="canEditExpense"
      :can-delete="canDeleteExpense"
      @edit="e.openEdit"
      @delete="e.requestDelete"
    />

    <UiPagination :page="e.filters.page" :total-pages="e.totalPages.value" @update:page="e.setPage" />

    <ExpenseFormModal
      ref="modalRef"
      v-model="e.modalOpen.value"
      :editing="e.editing.value"
      :default-center-id="e.scope.centerIdForCreate"
      :loading="saving"
      @submit="onSubmit"
    />
    <ExpenseDeleteDialog
      v-model="deleteOpen"
      :name="e.deleteTarget.value?.name ?? ''"
      :loading="e.deleting.value"
      @confirm="e.deleteTarget.value && e.confirmDelete(e.deleteTarget.value.id)"
    />
  </div>
</template>
