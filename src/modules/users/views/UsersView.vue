<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UiButton, UiInput, UiPagination, UiIcon } from '@/shared/components'
import { Plus, Search } from '@/shared/icons'
import { debounce } from '@/shared/utils/debounce'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useUsers } from '../composables/use-users'
import UsersTable from '../components/UsersTable.vue'
import UserFormModal from '../components/UserFormModal.vue'
import UserDeleteDialog from '../components/UserDeleteDialog.vue'
import type { UserForm } from '../interfaces/user-form.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const { canCreateUser, canEditUser, canDeleteUser, canViewStaffPerformance } = usePermissions()
const u = useUsers()
onMounted(u.init)

const columns = computed(() => [
  { key: 'id', label: t('users.table.id'), hideOnMobile: true },
  { key: 'firstName', label: t('users.table.firstName'), primary: true },
  { key: 'lastName', label: t('users.table.lastName') },
  { key: 'phone', label: t('users.table.phone') },
  { key: 'role', label: t('users.table.role') },
  { key: 'salary', label: t('users.table.salary'), align: 'right' as const },
  { key: 'commissionPercentage', label: t('users.table.commissionPercentage') },
  { key: 'center', label: t('users.table.center') },
])
const deleteOpen = computed({ get: () => u.deleteTarget.value !== null, set: (v: boolean) => { if (!v) u.deleteTarget.value = null } })

const modalRef = ref<{ setBackendErrors: (e: unknown) => void } | null>(null)
const saving = ref(false)
const deleting = ref(false)
const onSearch = debounce((e: Event) => u.search((e.target as HTMLInputElement).value))
const onSearchPhone = debounce((e: Event) => u.searchPhone((e.target as HTMLInputElement).value))

async function onSubmit(payload: UserForm) {
  saving.value = true
  try {
    await u.submit(payload)
  } catch (error) {
    modalRef.value?.setBackendErrors(error)
  } finally {
    saving.value = false
  }
}
async function onConfirmDelete() {
  deleting.value = true
  try {
    await u.confirmDelete()
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <div class="min-w-0 flex-1 sm:max-w-xs">
        <UiInput type="search" :placeholder="t('users.filter.namePlaceholder')" @input="onSearch">
          <template #prefix><UiIcon :icon="Search" :size="16" /></template>
        </UiInput>
      </div>
      <div class="min-w-0 flex-1 sm:max-w-xs">
        <UiInput type="search" :placeholder="t('users.filter.phonePlaceholder')" @input="onSearchPhone" />
      </div>
      <UiButton v-if="canCreateUser" class="ml-auto" @click="u.openCreate">
        <UiIcon :icon="Plus" :size="16" /> {{ t('common.add') }}
      </UiButton>
    </div>

    <UsersTable
      :columns="columns"
      :rows="u.rows.value"
      :loading="u.loading.value"
      :can-view="canViewStaffPerformance"
      :can-edit="canEditUser"
      :can-delete="canDeleteUser"
      @view="(user) => router.push(`/users/${user.id}`)"
      @edit="u.openEdit"
      @delete="u.requestDelete"
    />

    <UiPagination :page="u.filters.page" :total-pages="u.totalPages.value" @update:page="u.setPage" />

    <UserFormModal
      ref="modalRef"
      v-model="u.modalOpen.value"
      :editing="u.editing.value"
      :default-center-id="u.scope.centerIdForCreate"
      :loading="saving"
      @submit="onSubmit"
    />
    <UserDeleteDialog v-model="deleteOpen" :user="u.deleteTarget.value" :loading="deleting" @confirm="onConfirmDelete" />
  </div>
</template>
