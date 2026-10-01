<template>
  <UiTable
    :columns="columns"
    :rows="rows as unknown as Record<string, unknown>[]"
    :loading="loading"
    :empty-text="t('students.empty')"
  >
    <template #cell-subject="{ row }">{{ (row as Student).subject?.name ?? '—' }}</template>
    <template #cell-birthDate="{ row }">{{ formatDate((row as Student).birthDate) }}</template>
    <template #cell-monthlyFee="{ row }">
      <span class="font-mono">{{ formatSom(toNumber((row as Student).monthlyFee)) }}</span>
    </template>
    <template #cell-discount="{ row }">
      <StudentDiscountCell :student="row as Student" />
    </template>
    <template #cell-preferredTime="{ row }">{{ timeLabel(row as Student) }}</template>
    <template #cell-preferredDays="{ row }">
      <StudentDaysCell :days="(row as Student).preferredDays" />
    </template>
    <template #cell-returnLikelihood="{ row }">{{ likelihoodLabel(row as Student) }}</template>
    <template #cell-comment="{ row }">
      <span class="block max-w-[16rem] truncate" :title="(row as Student).comment ?? ''">{{
        (row as Student).comment || '—'
      }}</span>
    </template>
    <template #cell-status="{ row }">
      <StudentStatusCell
        :status="(row as Student).status"
        :can-edit="canEdit"
        :loading="(row as Student).statusLoading"
        @change="(s: StudentStatus) => emit('status-change', row as Student, s)"
      />
    </template>
    <template #actions="{ row }">
      <div class="flex justify-end gap-1">
        <!-- Opens the student card: payments by month, debt, parent QR. -->
        <UiIconButton
          :icon="Eye"
          :label="t('students.view.title')"
          @click="emit('open', row as Student)"
        />
        <UiIconButton
          v-if="canEdit"
          :icon="Pencil"
          tone="primary"
          :label="t('common.edit')"
          @click="emit('edit', row as Student)"
        />
        <UiIconButton
          v-if="deletable?.(row as Student)"
          :icon="Trash2"
          tone="danger"
          :label="t('common.delete')"
          @click="emit('delete', row as Student)"
        />
      </div>
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { UiTable, UiIconButton } from '@/shared/components'
import { Pencil, Eye, Trash2 } from '@/shared/icons'
import { formatSom } from '@/shared/utils/format-money'
import { formatDate } from '@/shared/utils/format-date'
import { PREFERRED_TIME_LABEL_KEYS } from '../enums/student-preferred-time.enum'
import { RETURN_LIKELIHOOD_LABEL_KEYS } from '../enums/return-likelihood.enum'
import type { StudentStatus } from '../enums/student-status.enum'
import StudentStatusCell from './StudentStatusCell.vue'
import StudentDiscountCell from './StudentDiscountCell.vue'
import StudentDaysCell from './StudentDaysCell.vue'
import type { Student } from '../interfaces/student.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  columns: TableColumn[]
  rows: Student[]
  loading?: boolean
  canEdit?: boolean
  /** Permission + NEW-status check for the delete action (`useStudentDelete().canDelete`). */
  deletable?: (student: Student) => boolean
}>()
const emit = defineEmits<{
  open: [student: Student]
  edit: [student: Student]
  delete: [student: Student]
  'status-change': [student: Student, status: StudentStatus]
}>()

const toNumber = (v: string | null | undefined): number | null =>
  v == null || v === '' ? null : Number(v)
const timeLabel = (s: Student) =>
  s.preferredTime ? t(PREFERRED_TIME_LABEL_KEYS[s.preferredTime]) : '—'
const likelihoodLabel = (s: Student) =>
  s.returnLikelihood ? t(RETURN_LIKELIHOOD_LABEL_KEYS[s.returnLikelihood]) : '—'
</script>
