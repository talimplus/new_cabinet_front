<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <div class="min-w-0">
        <h1 class="text-lg font-bold text-foreground">{{ t('holidays.title') }}</h1>
        <p class="text-sm text-muted-foreground">{{ t('holidays.subtitle') }}</p>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <UiSelect :model-value="year" :options="yearOptions" :clearable="false" :aria-label="t('holidays.year')" class="w-36" @update:model-value="setYear(Number($event))" />
        <UiButton v-if="canManageSchedule" @click="openForm"><UiIcon :icon="Plus" :size="16" />{{ t('common.add') }}</UiButton>
      </div>
    </div>

    <HolidaysTable :rows="rows" :loading="loading" :can-manage="canManageSchedule" :center-label="centerLabel" @delete="pendingDelete = $event" />

    <HolidayFormModal
      :state="form"
      :can-scope-to-center="canScopeToCenter"
      :active-center-name="activeCenterName"
      @close="closeForm"
      @change="setField"
      @submit="submit"
    />
    <UiConfirmDialog
      :model-value="!!pendingDelete"
      :title="t('holidays.deleteTitle')"
      :message="t('holidays.deleteText')"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiIcon, UiSelect, UiConfirmDialog } from '@/shared/components'
import { Plus } from '@/shared/icons'
import { usePermissions } from '@/shared/composables/use-permissions'
import HolidaysTable from '../components/HolidaysTable.vue'
import HolidayFormModal from '../components/HolidayFormModal.vue'
import { useHolidays } from '../composables/use-holidays'

const { t } = useI18n()
const { canManageSchedule } = usePermissions()
const {
  year, yearOptions, rows, loading, form, pendingDelete, deleting, canScopeToCenter, activeCenterName,
  load, setYear, openForm, setField, closeForm, submit, confirmDelete, centerLabel,
} = useHolidays()
onMounted(load)
</script>
