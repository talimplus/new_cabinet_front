<template>
  <div class="space-y-3">
    <div v-if="canTransfer" class="flex flex-wrap items-center justify-between gap-3">
      <UiCheckbox
        :model-value="tx.allSelected.value"
        :indeterminate="tx.someSelected.value"
        :label="t('groups.studentTable.selectAll')"
        @update:model-value="tx.toggleAll"
      />
      <div class="flex items-center gap-3">
        <span class="text-sm text-muted-foreground">
          {{ tx.selectedCount.value
            ? t('students.transfer.subtitle', { count: tx.selectedCount.value })
            : t('students.transfer.selectStudents') }}
        </span>
        <UiButton size="sm" :disabled="!tx.selectedCount.value" @click="tx.openTransfer">
          <UiIcon :icon="ArrowLeftRight" :size="16" />{{ t('students.transfer.action') }}
        </UiButton>
      </div>
    </div>

    <UiTable :columns="columns" :rows="rows" :loading="loading" :empty-text="t('groups.studentTable.empty')">
      <template v-if="canTransfer" #cell-select="{ row }">
        <UiCheckbox
          :model-value="tx.isSelected((row as Student).id)"
          @update:model-value="() => tx.toggle((row as Student).id)"
        />
      </template>
      <template #cell-id="{ row }"><span class="font-mono text-xs text-muted-foreground">#{{ (row as Student).id }}</span></template>
      <template #cell-fullName="{ row }">{{ (row as Student).firstName }} {{ (row as Student).lastName }}</template>
      <template #cell-phone="{ row }"><span class="font-mono">{{ (row as Student).phone || '—' }}</span></template>
      <template #cell-status="{ row }">
        <UiBadge :variant="variants[(row as Student).status]">{{ t(labelKeys[(row as Student).status]) }}</UiBadge>
      </template>
    </UiTable>

    <StudentTransferModal
      :state="tx.transfer.state"
      :group-options="tx.transfer.groupOptions.value"
      :total-debt="tx.transfer.totalDebt.value"
      :total-overpaid="tx.transfer.totalOverpaid.value"
      :valid="tx.transfer.valid.value"
      @close="tx.transfer.close"
      @confirm="tx.transfer.submit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UiTable, UiBadge, UiButton, UiIcon, UiCheckbox } from '@/shared/components'
import StudentTransferModal from '@/shared/components/transfer/StudentTransferModal.vue'
import { ArrowLeftRight } from '@/shared/icons'
import { useGroupStudentsTransfer } from '../../composables/use-group-students-transfer'
import {
  STUDENT_STATUS_LABEL_KEYS,
  STUDENT_STATUS_VARIANTS,
} from '@/modules/students/enums/student-status.enum'
import type { Student } from '@/modules/students/interfaces/student.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  students: Student[]
  loading?: boolean
  groupId: number
  groupName: string
  canTransfer?: boolean
}>()
const emit = defineEmits<{ reload: [] }>()

const labelKeys = STUDENT_STATUS_LABEL_KEYS
const variants = STUDENT_STATUS_VARIANTS

const tx = useGroupStudentsTransfer(
  props.groupId,
  () => props.groupName,
  () => props.students.map((s) => s.id),
  () => emit('reload'),
)

const rows = computed(() => props.students as unknown as Array<Record<string, unknown>>)
const columns = computed<TableColumn[]>(() => [
  ...(props.canTransfer ? [{ key: 'select', label: '' }] : []),
  { key: 'id', label: t('groups.studentTable.id'), hideOnMobile: true },
  { key: 'fullName', label: t('groups.studentTable.fullName'), primary: true },
  { key: 'phone', label: t('groups.studentTable.phone') },
  { key: 'status', label: t('groups.studentTable.status') },
])
</script>
