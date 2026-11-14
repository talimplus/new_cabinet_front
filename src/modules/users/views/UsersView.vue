<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UiPagination, UiTabs, UiConfirmDialog } from '@/shared/components'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useUsers } from '../composables/use-users'
import { useUserDismiss } from '../composables/use-user-dismiss'
import UsersToolbar from '../components/UsersToolbar.vue'
import UsersTable from '../components/UsersTable.vue'
import UserFormModal from '../components/UserFormModal.vue'
import UserDeleteDialog from '../components/UserDeleteDialog.vue'
import UserBlockDialog from '../components/UserBlockDialog.vue'
import UserDismissModal from '../components/UserDismissModal.vue'
import StaffExtraDialog from '@/shared/components/staff-extras/StaffExtraDialog.vue'
import { StaffExtraKind } from '@/shared/enums/staff-extra-kind.enum'
import { useUserStore } from '@/stores/user.store'
import type { UserForm } from '../interfaces/user-form.interface'
import type { User } from '../interfaces/user.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const { canCreateUser, canEditUser, canDeleteUser, canViewStaffPerformance, canPaySalary } = usePermissions()
const u = useUsers()
const d = useUserDismiss(() => u.load())
onMounted(u.init)

// Advance / bonus right from the list — no salary row is needed for that.
const extraRef = ref<InstanceType<typeof StaffExtraDialog> | null>(null)
const openExtra = (kind: StaffExtraKind, x: User) => extraRef.value?.open(kind, { userId: x.id, name: `${x.firstName} ${x.lastName}` })
const deleteOpen = computed({ get: () => u.deleteTarget.value !== null, set: (v: boolean) => { if (!v) u.deleteTarget.value = null } })
const reinstateName = computed(() => (d.reinstateTarget.value ? `${d.reinstateTarget.value.firstName} ${d.reinstateTarget.value.lastName}` : ''))

const modalRef = ref<{ setBackendErrors: (e: unknown) => void } | null>(null)
const saving = ref(false)
const deleting = ref(false)

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
    <UiTabs :tabs="u.tabs" :model-value="u.filters.tab" @update:model-value="u.setTab" />
    <UsersToolbar
      :name="u.filters.name" :phone="u.filters.phone" :can-create="canCreateUser && !u.isArchive.value"
      @name="u.search" @phone="u.searchPhone" @create="u.openCreate"
    />
    <p v-if="u.isArchive.value" class="rounded-md bg-info-soft px-3 py-2 text-xs text-info">{{ t('users.archive.hint') }}</p>

    <UsersTable
      :columns="u.columns.value" :rows="u.rows.value" :loading="u.loading.value" :self-id="userStore.user?.id ?? null" :archive="u.isArchive.value"
      :can-view="canViewStaffPerformance" :can-edit="canEditUser" :can-delete="canDeleteUser" :can-pay="canPaySalary"
      @view="(user) => router.push(`/users/${user.id}`)" @edit="u.openEdit" @delete="u.requestDelete"
      @toggle-active="u.requestToggleActive" @dismiss="d.open" @reinstate="d.reinstateTarget.value = $event"
      @advance="openExtra(StaffExtraKind.ADVANCE, $event)" @bonus="openExtra(StaffExtraKind.BONUS, $event)"
    />
    <StaffExtraDialog ref="extraRef" />
    <UiPagination :page="u.filters.page" :total-pages="u.totalPages.value" @update:page="u.setPage" />

    <UserFormModal
      ref="modalRef" v-model="u.modalOpen.value" :editing="u.editing.value"
      :default-center-id="u.scope.centerIdForCreate" :loading="saving" @submit="onSubmit"
    />
    <UserBlockDialog :user="u.toggleTarget.value" :loading="u.toggling.value" @confirm="u.confirmToggleActive" @cancel="u.toggleTarget.value = null" />
    <UserDismissModal :state="d.state" @close="d.close" @confirm="d.submit" />
    <UiConfirmDialog
      :model-value="!!d.reinstateTarget.value" :title="t('users.reinstate.title')" :message="t('users.reinstate.text', { name: reinstateName })"
      :loading="d.reinstating.value" @confirm="d.confirmReinstate" @cancel="d.reinstateTarget.value = null"
    />
    <UserDeleteDialog v-model="deleteOpen" :user="u.deleteTarget.value" :loading="deleting" @confirm="onConfirmDelete" />
  </div>
</template>
