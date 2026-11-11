<template>
  <div class="space-y-3">
    <GroupStudentsTransferBar
      v-if="canTransfer"
      :all-selected="tx.allSelected.value"
      :some-selected="tx.someSelected.value"
      :selected-count="tx.selectedCount.value"
      @toggle-all="tx.toggleAll"
      @transfer="tx.openTransfer"
    />

    <UiTable :columns="columns" :rows="rows" :loading="loading" :empty-text="t('groups.studentTable.empty')">
      <template v-if="canTransfer" #cell-select="{ row }">
        <UiCheckbox :model-value="tx.isSelected((row as Student).id)" @update:model-value="() => tx.toggle((row as Student).id)" />
      </template>
      <template #cell-fullName="{ row }"><RouterLink :to="{ name: 'student-card', params: { id: (row as Student).id } }" class="font-medium text-primary hover:underline">{{ (row as Student).lastName }} {{ (row as Student).firstName }}</RouterLink></template>
      <template #cell-phone="{ row }"><span class="whitespace-nowrap font-mono">{{ formatPhone((row as Student).phone) || '—' }}</span></template>
      <template #cell-status="{ row }">
        <UiBadge :variant="variants[(row as Student).status]">{{ t(labelKeys[(row as Student).status]) }}</UiBadge>
      </template>
      <template v-if="canLeave" #actions="{ row }">
        <UiIconButton
          v-if="(row as Student).status === StudentStatus.ACTIVE"
          :icon="DoorOpen"
          tone="danger"
          :label="t('groups.leave.action')"
          @click="leaveRef?.open(row as Student)"
        />
      </template>
    </UiTable>

    <GroupFormerStudents :key="students.length" :group-id="groupId" :group-name="groupName" />

    <StudentTransferModal
      allow-close-source
      :state="tx.transfer.state"
      :group-options="tx.transfer.groupOptions.value"
      :total-debt="tx.transfer.totalDebt.value"
      :total-overpaid="tx.transfer.totalOverpaid.value"
      :impact="tx.transfer.impact.value"
      :valid="tx.transfer.valid.value"
      @close="tx.transfer.close"
      @confirm="tx.transfer.submit"
    />
    <GroupStudentLeaveModal ref="leaveRef" :group-id="groupId" :group-name="groupName" @done="emit('reload')" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiTable, UiBadge, UiCheckbox, UiIconButton } from '@/shared/components'
import StudentTransferModal from '@/shared/components/transfer/StudentTransferModal.vue'
import GroupFormerStudents from './GroupFormerStudents.vue'
import GroupStudentLeaveModal from './GroupStudentLeaveModal.vue'
import GroupStudentsTransferBar from './GroupStudentsTransferBar.vue'
import { DoorOpen } from '@/shared/icons'
import { formatPhone } from '@/shared/utils/format-phone'
import { useGroupStudentsTransfer } from '../../composables/use-group-students-transfer'
import {
  StudentStatus,
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
  canLeave?: boolean
}>()
const leaveRef = ref<InstanceType<typeof GroupStudentLeaveModal> | null>(null)
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
  { key: 'index', label: t('groups.studentTable.index'), rowNumber: true },
  { key: 'fullName', label: t('groups.studentTable.fullName'), primary: true },
  { key: 'phone', label: t('groups.studentTable.phone') },
  { key: 'status', label: t('groups.studentTable.status') },
])
</script>
