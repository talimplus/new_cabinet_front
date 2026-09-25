<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiSelect, UiInput, UiPagination, UiIcon } from '@/shared/components'
import { Plus, Search, Sparkles } from '@/shared/icons'
import { debounce } from '@/shared/utils/debounce'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useSyllabuses } from '../composables/use-syllabuses'
import SyllabusesTable from '../components/SyllabusesTable.vue'
import SyllabusFormModal from '../components/SyllabusFormModal.vue'
import SyllabusDeleteDialog from '../components/SyllabusDeleteDialog.vue'
import AiSyllabusModal from '../components/AiSyllabusModal.vue'

const { t } = useI18n()

const s = useSyllabuses()
onMounted(s.init)

const { canManageSyllabus, canUseSyllabusAi } = usePermissions()
const onSearch = debounce((e: Event) => s.search((e.target as HTMLInputElement).value))
const deleteOpen = ref(false)

function onDeleteChange(open: boolean) {
  deleteOpen.value = open
  if (!open) s.deleteTarget.value = null
}
function requestDelete(item: Parameters<typeof s.requestDelete>[0]) {
  s.requestDelete(item)
  deleteOpen.value = true
}
async function confirmDelete() {
  await s.confirmDelete()
  deleteOpen.value = false
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <div class="w-full sm:max-w-xs">
        <UiSelect
          :model-value="s.filters.subjectId"
          :options="s.subjectOptions.value"
          :placeholder="t('syllabuses.filter.subject')"
          @update:model-value="(v) => { s.filters.subjectId = (typeof v === 'number' ? v : null); s.applyFilters() }"
        />
      </div>
      <div class="min-w-0 flex-1 sm:max-w-xs">
        <UiInput type="search" :placeholder="t('common.searchPlaceholder')" @input="onSearch">
          <template #prefix><UiIcon :icon="Search" :size="16" /></template>
        </UiInput>
      </div>
      <div v-if="canManageSyllabus || canUseSyllabusAi" class="ml-auto flex gap-2">
        <UiButton v-if="canUseSyllabusAi" variant="outline" @click="s.openAi">
          <UiIcon :icon="Sparkles" :size="16" /> {{ t('syllabuses.aiChat.button') }}
        </UiButton>
        <UiButton v-if="canManageSyllabus" @click="s.openCreate">
          <UiIcon :icon="Plus" :size="16" /> {{ t('common.add') }}
        </UiButton>
      </div>
    </div>

    <SyllabusesTable
      :rows="s.rows.value"
      :loading="s.loading.value"
      :can-manage="canManageSyllabus"
      @delete="requestDelete"
    />

    <UiPagination :page="s.filters.page" :total-pages="s.totalPages.value" @update:page="s.setPage" />

    <SyllabusFormModal v-model="s.modalOpen.value" :subjects="s.subjectOptions.value" @saved="s.load" />
    <AiSyllabusModal v-model:open="s.aiModalOpen.value" :subject-options="s.subjectOptions.value" @created="s.load" />
    <SyllabusDeleteDialog
      :model-value="deleteOpen"
      :name="s.deleteTarget.value?.name ?? ''"
      :loading="s.deleteLoading.value"
      @update:model-value="onDeleteChange"
      @confirm="confirmDelete"
    />
  </div>
</template>
