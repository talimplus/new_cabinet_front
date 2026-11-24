<template>
  <UiModal
    :model-value="f.state.open"
    :title="t('students.personalFee.title')"
    size="lg"
    :close-on-overlay="!f.saving.value"
    @update:model-value="f.state.open = $event"
  >
    <div class="space-y-4">
      <p class="text-sm text-muted-foreground">
        {{ t('students.personalFee.hint', { group: f.preview.value?.groupName ?? '', amount: formatSom(f.preview.value?.personalFee ?? 0) }) }}
      </p>
      <UiDatepicker
        :model-value="f.dateModel.value"
        :enable-time="false"
        :clearable="false"
        :min-date="f.minDate.value"
        :max-date="new Date()"
        :label="t('students.personalFee.fromDate')"
        :hint="t('students.personalFee.fromDateHint')"
        :error="f.error.value"
        @update:model-value="f.pickDate($event instanceof Date ? $event : null)"
      />
      <UiSelect
        v-if="f.hasOverpayment.value"
        :model-value="f.state.overpayment"
        :options="overpaymentOptions"
        :label="t('students.personalFee.overpayment.label', { amount: formatSom(f.preview.value?.totals.refund ?? 0) })"
        :hint="t(f.state.overpayment === OverpaymentMode.CARRY ? 'students.personalFee.overpayment.carryHint' : 'students.personalFee.overpayment.refundHint')"
        :clearable="false"
        :searchable="false"
        @update:model-value="f.state.overpayment = $event as OverpaymentMode"
      />
      <p v-if="f.preview.value?.rows.length" class="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
        {{ t('common.backdate.warning') }}
      </p>
      <BackdateImpact :preview="f.preview.value" :loading="f.loading.value" />
    </div>
    <template #footer>
      <UiButton variant="outline" :disabled="f.saving.value" @click="f.state.open = false">
        {{ t('common.cancel') }}
      </UiButton>
      <UiButton :loading="f.saving.value" :disabled="!f.canSubmit.value" @click="f.submit">
        {{ t('students.personalFee.confirm') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiSelect, UiDatepicker, UiButton } from '@/shared/components'
import BackdateImpact from '@/shared/components/backdate/BackdateImpact.vue'
import { formatSom } from '@/shared/utils/format-money'
import { useStudentPersonalFee } from '../../composables/use-student-personal-fee'
import { OverpaymentMode, OVERPAYMENT_MODE_LABEL_KEYS } from '../../enums/overpayment-mode.enum'

const { t } = useI18n()
const emit = defineEmits<{ done: [] }>()
const f = useStudentPersonalFee(() => emit('done'))

const overpaymentOptions = computed(() =>
  Object.values(OverpaymentMode).map((v) => ({ label: t(OVERPAYMENT_MODE_LABEL_KEYS[v]), value: v })),
)

defineExpose({ open: (studentId: number, groupId: number) => f.open(studentId, groupId) })
</script>
