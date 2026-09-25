<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GenericObject } from 'vee-validate'
import { UiButton, UiInput, UiTable, UiIconButton, UiIcon } from '@/shared/components'
import { Plus, Pencil, Trash2 } from '@/shared/icons'
import { debounce } from '@/shared/utils/debounce'
import { usePermissions } from '@/shared/composables/use-permissions'
import RoomFormModal from '../components/RoomFormModal.vue'
import { useRooms } from '../composables/use-rooms'
import type { Room } from '../interfaces/room.interface'

const { t } = useI18n()

const {
  scope,
  rows,
  loading,
  modalOpen,
  editing,
  init,
  search,
  openCreate,
  openEdit,
  submit,
  remove,
} = useRooms()
onMounted(init)

const { canManageRooms } = usePermissions()
const modalRef = ref<{ setBackendErrors: (e: unknown) => void } | null>(null)
const saving = ref(false)
const columns = computed(() => [{ key: 'name', label: t('rooms.headers.room') }])
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
async function onDelete(room: Room) {
  if (confirm(t('common.confirmDeleteNamed', { name: room.name }))) await remove(room)
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
      <UiButton v-if="canManageRooms" @click="openCreate"
        ><UiIcon :icon="Plus" :size="16" /> {{ t('common.create') }}</UiButton
      >
    </div>

    <UiTable :columns="columns" :rows="rows" :loading="loading" :empty-text="t('rooms.empty')">
      <template #actions="{ row }">
        <div v-if="canManageRooms" class="flex justify-end gap-1">
          <UiIconButton
            :icon="Pencil"
            tone="primary"
            :label="t('common.edit')"
            @click="openEdit(row as Room)"
          />
          <UiIconButton
            :icon="Trash2"
            tone="danger"
            :label="t('common.delete')"
            @click="onDelete(row as Room)"
          />
        </div>
      </template>
    </UiTable>

    <RoomFormModal
      ref="modalRef"
      v-model="modalOpen"
      :editing="editing"
      :default-center-id="scope.centerIdForCreate"
      :loading="saving"
      @submit="onSubmit"
    />
  </div>
</template>
