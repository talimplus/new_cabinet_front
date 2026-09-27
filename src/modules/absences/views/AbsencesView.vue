<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-lg font-bold text-foreground">{{ t('absences.title') }}</h1>
      <p class="text-sm text-muted-foreground">{{ t('absences.subtitle') }}</p>
    </div>

    <AbsencesSummary :summary="summary" />

    <AbsencesFilters
      :filters="filters"
      :group-options="groupOptions"
      :teacher-options="teacherOptions"
      @change="setFilters"
      @search="setSearch"
      @teacher="setTeacher"
    />

    <AbsencesTable :rows="rows" :loading="loading" :can-manage="canManageAttendance" @follow-up="openFollowUp" />
    <UiPagination :page="filters.page" :total-pages="totalPages" @update:page="setPage" />

    <AbsenceFollowUpModal :open="followUpOpen" :state="followUp" @close="closeFollowUp" @submit="submitFollowUp" @update:note="setNote" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiPagination } from '@/shared/components'
import { usePermissions } from '@/shared/composables/use-permissions'
import AbsencesSummary from '../components/AbsencesSummary.vue'
import AbsencesFilters from '../components/AbsencesFilters.vue'
import AbsencesTable from '../components/AbsencesTable.vue'
import AbsenceFollowUpModal from '../components/AbsenceFollowUpModal.vue'
import { useAbsences } from '../composables/use-absences'

const { t } = useI18n()
const { canManageAttendance } = usePermissions()
const {
  filters, rows, summary, totalPages, loading, groupOptions, teacherOptions,
  followUp, followUpOpen, init, setFilters, setSearch, setNote, setTeacher, setPage,
  openFollowUp, closeFollowUp, submitFollowUp,
} = useAbsences()
onMounted(init)
</script>
