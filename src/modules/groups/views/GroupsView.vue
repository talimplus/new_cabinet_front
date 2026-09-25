<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { UiButton, UiIcon, UiPagination, UiConfirmDialog } from '@/shared/components'
import { Plus } from '@/shared/icons'
import { usePermissions } from '@/shared/composables/use-permissions'
import GroupFilters from '../components/GroupFilters.vue'
import GroupsTable from '../components/GroupsTable.vue'
import GroupFormModal from '../components/GroupFormModal.vue'
import { useGroups } from '../composables/use-groups'
import type { GroupForm } from '../interfaces/group-form.interface'

const { t } = useI18n()
const router = useRouter()
const { canCreateGroup, canEditGroup, canDeleteGroup, canChangeGroupStatus } = usePermissions()

const {
  scope, rows, totalPages, loading, filters, showTeacherFilter, teacherOptions,
  modalOpen, editing, statusErrors, pendingDelete, deleting, pendingFinish,
  init, setPage, setTeacher, openCreate, openEdit, submit, askDelete, confirmDelete, setStatus, confirmFinish,
} = useGroups()
onMounted(init)

const modalRef = ref<{ setBackendErrors: (e: unknown) => void } | null>(null)
const saving = ref(false)
const deleteMessage = computed(() =>
  pendingDelete.value ? t('common.confirmDeleteNamed', { name: pendingDelete.value.name }) : '',
)

async function onSubmit(payload: GroupForm) {
  saving.value = true
  try {
    await submit(payload)
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
      <GroupFilters
        v-if="showTeacherFilter"
        :teacher-id="filters.teacherId"
        :options="teacherOptions"
        @update:teacher-id="setTeacher"
      />
      <UiButton v-if="canCreateGroup" class="ml-auto" @click="openCreate">
        <UiIcon :icon="Plus" :size="16" /> {{ t('common.create') }}
      </UiButton>
    </div>

    <GroupsTable
      :rows="rows"
      :loading="loading"
      :can-edit="canEditGroup"
      :can-delete="canDeleteGroup"
      :can-change-status="canChangeGroupStatus"
      @detail="(g) => router.push(`/groups/${g.id}`)"
      @edit="(g) => openEdit(g)"
      @delete="askDelete"
      @status="setStatus"
    />

    <UiPagination :page="filters.page" :total-pages="totalPages" @update:page="setPage" />

    <GroupFormModal
      ref="modalRef"
      v-model="modalOpen"
      :editing="editing"
      :status-errors="statusErrors"
      :default-center-id="scope.centerIdForCreate"
      :loading="saving"
      @submit="onSubmit"
    />

    <UiConfirmDialog
      :model-value="!!pendingDelete"
      :title="t('common.delete')"
      :message="deleteMessage"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
    <UiConfirmDialog
      :model-value="!!pendingFinish"
      :title="t('groups.statusChange.finishTitle')"
      :message="t('groups.statusChange.finishText')"
      :confirm-label="t('groups.statusChange.confirm')"
      @confirm="confirmFinish"
      @cancel="pendingFinish = null"
    />
  </div>
</template>
