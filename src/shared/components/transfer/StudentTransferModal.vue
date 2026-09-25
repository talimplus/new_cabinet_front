<template>
  <UiModal
    :model-value="state.open"
    :title="t('students.transfer.title')"
    size="md"
    :close-on-overlay="false"
    @update:model-value="emit('close')"
  >
    <div class="space-y-4">
      <p class="text-sm text-muted-foreground">{{ t('students.transfer.billingHint') }}</p>

      <UiSelect
        :model-value="state.toGroupId"
        :options="groupOptions"
        :label="t('students.transfer.toGroup')"
        :placeholder="t('students.transfer.toGroupRequired')"
        :disabled="state.loading"
        @update:model-value="state.toGroupId = typeof $event === 'number' ? $event : null"
      />
      <UiDatepicker
        :model-value="state.date"
        :label="t('students.transfer.date')"
        :hint="t('students.transfer.dateHint')"
        :disabled="state.loading"
        @update:model-value="state.date = Array.isArray($event) ? ($event[0] ?? null) : $event"
      />
      <UiTextarea
        v-model="state.reason"
        :label="t('students.transfer.reason')"
        :rows="2"
        :disabled="state.loading"
      />
      <UiCheckbox
        v-model="state.closeSourceGroup"
        :label="t('students.transfer.closeSourceGroup')"
        :disabled="state.loading"
      />

      <p v-if="state.previewing" class="text-xs text-muted-foreground">
        {{ t('payments.exclusion.calculating') }}
      </p>
      <template v-else>
        <!-- A debt never blocks the move — it simply stays with the old group. -->
        <p v-if="totalDebt > 0" class="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
          {{ t('students.transfer.debtWarning', { amount: formatSom(totalDebt) }) }}
        </p>
        <p v-if="totalOverpaid > 0" class="rounded-md bg-info-soft px-3 py-2 text-xs text-info">
          {{ t('students.transfer.overpaidNotice', { amount: formatSom(totalOverpaid) }) }}
        </p>
      </template>
    </div>

    <template #footer>
      <UiButton variant="ghost" :disabled="state.loading" @click="emit('close')">
        {{ t('common.cancel') }}
      </UiButton>
      <UiButton :loading="state.loading" :disabled="!valid" @click="emit('confirm')">
        {{ t('students.transfer.submit') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiModal, UiButton, UiSelect, UiDatepicker, UiTextarea, UiCheckbox } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { useStudentTransfer } from '@/shared/composables/use-student-transfer'

const { t } = useI18n()

/** `state` is the composable's reactive object, so v-model writes flow back. */
defineProps<{
  state: ReturnType<typeof useStudentTransfer>['state']
  groupOptions: SelectOption[]
  totalDebt: number
  totalOverpaid: number
  valid?: boolean
}>()
const emit = defineEmits<{ close: []; confirm: [] }>()
</script>
