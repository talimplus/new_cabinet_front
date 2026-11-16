<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <TeacherDashboardFilters
        class="min-w-0 flex-1"
        :month="d.filters.month"
        :teacher-id="d.filters.teacherId"
        :teacher-options="d.teacherOptions.value"
        :show-teacher="!d.isTeacher.value"
        @update:month="d.setMonth"
        @update:teacher-id="d.setTeacher"
      />
      <UiIconButton :icon="RefreshCw" :label="t('common.refresh')" :disabled="d.loading.value" @click="d.load" />
    </div>

    <p v-if="d.needsTeacher.value" class="rounded-lg bg-info-soft p-4 text-sm text-info">
      {{ t('teacherDashboard.pickTeacher') }}
    </p>
    <div v-else-if="d.loading.value && !d.data.value" class="p-8 text-center">
      <UiSpinner :size="24" class="mx-auto text-muted-foreground" />
    </div>
    <template v-else-if="d.data.value">
      <TeacherDashboardTiles :data="d.data.value" :debtors-count="d.list.debtorsCount.value" />
      <TeacherStudentsSection
        :filters="d.filters"
        :list="d.list"
        :has-groups="d.data.value.groups.length > 0"
        :can-open-group="canViewGroups"
        :can-open-student="canViewStudents"
        @change="d.patchFilters"
        @open-group="(id) => router.push(`/groups/${id}`)"
        @open-student="(id) => router.push({ name: 'student-card', params: { id } })"
      />
      <div class="grid gap-4 lg:grid-cols-2">
        <TeacherPaymentsCard :totals="d.data.value.totals" />
        <TeacherAttendanceCard :attendance="d.data.value.totals.attendance" />
      </div>
      <TeacherSalaryCard :salary="d.data.value.salary" />
      <TeacherTrendCard :trend="d.data.value.trend" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { UiIconButton, UiSpinner } from '@/shared/components'
import { RefreshCw } from '@/shared/icons'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useTeacherDashboard } from '../composables/use-teacher-dashboard'
import TeacherDashboardFilters from '../components/TeacherDashboardFilters.vue'
import TeacherDashboardTiles from '../components/TeacherDashboardTiles.vue'
import TeacherStudentsSection from '../components/TeacherStudentsSection.vue'
import TeacherPaymentsCard from '../components/TeacherPaymentsCard.vue'
import TeacherAttendanceCard from '../components/TeacherAttendanceCard.vue'
import TeacherTrendCard from '../components/TeacherTrendCard.vue'
import TeacherSalaryCard from '../components/TeacherSalaryCard.vue'

const { t } = useI18n()
const router = useRouter()
const { canViewGroups, canViewStudents } = usePermissions()
const d = useTeacherDashboard()
onMounted(d.init)
</script>
