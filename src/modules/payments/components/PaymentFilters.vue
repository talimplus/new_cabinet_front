<template>
  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <UiSelect
      :model-value="year"
      :options="yearOptions"
      :searchable="false"
      :clearable="false"
      :placeholder="t('payments.filters.year')"
      @update:model-value="update('year', toNum($event))"
    />
    <UiSelect
      :model-value="status"
      :options="statusOptions"
      :searchable="false"
      :clearable="false"
      :placeholder="t('payments.table.status')"
      @update:model-value="update('status', $event)"
    />
    <!-- Picking a teacher narrows the group list to that teacher's groups. -->
    <UiSelect
      v-if="canViewTeachers"
      :model-value="teacherId"
      :options="teacherOptions"
      :placeholder="t('payments.filters.teacher')"
      @update:model-value="emit('teacher', toNum($event))"
    />
    <UiSelect
      v-if="canViewGroups"
      :model-value="groupId"
      :options="groupOptions"
      :placeholder="t('payments.filters.group')"
      @update:model-value="update('groupId', toNum($event))"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UiSelect } from '@/shared/components'
import { usePermissions } from '@/shared/composables/use-permissions'
import { PaymentStatus, PAYMENT_STATUS_LABEL_KEYS } from '../enums/payment-status.enum'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { canViewGroups, canViewTeachers } = usePermissions()

defineProps<{ groupOptions: SelectOption[]; teacherOptions: SelectOption[] }>()

const year = defineModel<number>('year', { required: true })
const status = defineModel<PaymentStatus | 'all'>('status', { default: 'all' })
const groupId = defineModel<number | null>('groupId', { default: null })
const teacherId = defineModel<number | null>('teacherId', { default: null })
const emit = defineEmits<{ change: []; teacher: [id: number | null] }>()

const currentYear = new Date().getFullYear()
const yearOptions: SelectOption[] = [currentYear - 1, currentYear, currentYear + 1].map((y) => ({
  label: String(y),
  value: y,
}))
const statusOptions = computed<SelectOption[]>(() => [
  { label: t('common.all'), value: 'all' },
  ...Object.values(PaymentStatus).map((v) => ({ label: t(PAYMENT_STATUS_LABEL_KEYS[v]), value: v })),
])

const toNum = (v: unknown): number | null => (typeof v === 'number' ? v : null)

const models = { year, status, groupId }
function update(key: keyof typeof models, value: unknown) {
  ;(models[key].value as unknown) = value
  emit('change')
}
</script>
