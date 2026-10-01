<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { UiButton, UiInput, UiPagination, UiIcon } from '@/shared/components'
import { Plus, Search } from '@/shared/icons'
import { debounce } from '@/shared/utils/debounce'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useStudents } from '../composables/use-students'
import { STUDENT_PAGES } from '../config/student-pages'
import StudentsTable from '../components/StudentsTable.vue'
import StudentFilters from '../components/StudentFilters.vue'
import StudentFormModal from '../components/StudentFormModal.vue'
import StudentReturnDialog from '../components/StudentReturnDialog.vue'
import StudentDeleteDialog from '../components/StudentDeleteDialog.vue'
import { useStudentDelete } from '../composables/use-student-delete'
import type { StudentForm } from '../interfaces/student-form.interface'

const { t } = useI18n()
const router = useRouter()

const props = defineProps<{ variant: string }>()
const config = computed(() => STUDENT_PAGES[props.variant] ?? STUDENT_PAGES.reception!)

const s = useStudents(() => config.value.status)
onMounted(s.init)
// Re-init when navigating between student pages (same component, different route).
watch(() => props.variant, () => s.init())

const { canEditStudent, canChangeStudentStatus, canCreateStudent } = usePermissions()
// The row actions cover editing and the status dropdown — either key enables them.
const canEdit = computed(() => canEditStudent.value || canChangeStudentStatus.value)
// Column labels are i18n keys in the config; translate them here.
const columns = computed(() => config.value.columns.map((c) => ({ ...c, label: t(c.label) })))
const hasFilters = computed(() => Object.values(config.value.filters).some(Boolean))

const modalRef = ref<{ setBackendErrors: (e: unknown) => void } | null>(null)
const onSearch = debounce((e: Event) => s.search((e.target as HTMLInputElement).value))
const onSubmit = (payload: StudentForm) =>
  s.submit(payload).catch((error) => modalRef.value?.setBackendErrors(error))
// Deleting a NEW student — the list (and its pagination) is reloaded afterwards.
const del = useStudentDelete(() => s.load())
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <div class="min-w-0 flex-1 sm:max-w-xs">
        <UiInput type="search" :placeholder="t('common.searchPlaceholder')" @input="onSearch">
          <template #prefix><UiIcon :icon="Search" :size="16" /></template>
        </UiInput>
      </div>
      <UiButton v-if="config.showCreate && canCreateStudent" class="ml-auto" @click="s.openCreate">
        <UiIcon :icon="Plus" :size="16" /> {{ t('common.add') }}
      </UiButton>
    </div>

    <StudentFilters
      v-if="hasFilters"
      v-model:subject-id="s.filters.subjectId"
      v-model:preferred-time="s.filters.preferredTime"
      v-model:preferred-days="s.filters.preferredDays"
      v-model:return-likelihood="s.filters.returnLikelihood"
      :subject-options="s.subjectOptions.value"
      :show-subject="config.filters.subject"
      :show-preferred-time="config.filters.preferredTime"
      :show-preferred-days="config.filters.preferredDays"
      :show-return-likelihood="config.filters.returnLikelihood"
      @change="s.applyFilters"
    />

    <StudentsTable
      :columns="columns"
      :rows="s.rows.value"
      :loading="s.loading.value"
      :can-edit="canEdit"
      :deletable="del.canDelete"
      @open="router.push({ name: 'student-card', params: { id: $event.id } })"
      @edit="s.openEdit"
      @delete="del.request"
      @status-change="s.requestStatus"
    />

    <UiPagination :page="s.filters.page" :total-pages="s.totalPages.value" @update:page="s.setPage" />

    <StudentFormModal
      ref="modalRef"
      v-model="s.modalOpen.value"
      :editing="s.editing.value"
      :default-center-id="s.scope.centerIdForCreate"
      :loading="s.saving.value"
      @submit="onSubmit"
    />
    <StudentReturnDialog v-model="s.returnDialog.open" @confirm="s.confirmReturn" />
    <StudentDeleteDialog
      :open="!!del.target.value" :name="del.name.value" :loading="del.deleting.value"
      @confirm="del.confirm" @cancel="del.cancel"
    />
  </div>
</template>
