<template>
  <UiModal :model-value="f.form.open" :title="t(STAFF_EXTRA_TITLE_KEYS[f.form.kind])" size="sm" @update:model-value="f.close">
    <div v-if="f.form.target" class="space-y-3">
      <p class="rounded-md bg-surface-muted px-3 py-2 text-sm">
        <span class="text-muted-foreground">{{ t('payroll.extras.worker') }}:</span>
        <span class="font-medium"> {{ f.form.target.name }}</span>
      </p>
      <p :class="cn('rounded-md px-3 py-2 text-xs', f.isBonus.value ? 'bg-success-soft text-success' : 'bg-info-soft text-info')">
        {{ t(f.isBonus.value ? 'payroll.extras.bonusHint' : 'payroll.extras.advanceHint') }}
      </p>
      <UiMoneyInput
        :model-value="f.form.amount ?? ''"
        :label="t('payroll.extras.amount')"
        :error="f.form.errors.amount"
        :disabled="f.form.saving"
        required
        @update:model-value="f.setField({ amount: $event === '' ? null : Number($event) })"
      />
      <UiInput
        :model-value="f.form.forMonth"
        type="month"
        :label="t(f.isBonus.value ? 'payroll.extras.bonusMonth' : 'payroll.extras.advanceMonth')"
        :hint="f.monthHint.value"
        :error="f.form.errors.forMonth"
        :disabled="f.form.saving"
        required
        @update:model-value="f.setField({ forMonth: String($event) })"
      />
      <UiTextarea
        :model-value="f.form.text"
        :label="t(f.isBonus.value ? 'payroll.extras.reason' : 'payroll.extras.comment')"
        :hint="t('payroll.extras.reasonHint')"
        :error="f.form.errors.reason"
        :rows="2"
        :required="f.isBonus.value"
        :disabled="f.form.saving"
        @update:model-value="f.setField({ text: $event })"
      />
    </div>
    <template #footer>
      <UiButton variant="ghost" :disabled="f.form.saving" @click="f.close">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="f.form.saving" @click="f.submit">{{ t('common.save') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import UiModal from '../UiModal.vue'
import UiMoneyInput from '../UiMoneyInput.vue'
import UiInput from '../UiInput.vue'
import UiTextarea from '../UiTextarea.vue'
import UiButton from '../UiButton.vue'
import { cn } from '@/shared/utils/cn'
import { useStaffExtraForm } from '@/shared/composables/use-staff-extra-form'
import { STAFF_EXTRA_TITLE_KEYS, StaffExtraKind } from '@/shared/enums/staff-extra-kind.enum'
import type { StaffExtraTarget } from '@/shared/interfaces/staff-extras.interface'

const { t } = useI18n()

/**
 * Self-contained "Avans berish" / "Mukofot" dialog — open it through the ref:
 * `extraRef.value?.open(StaffExtraKind.ADVANCE, { userId, name })`.
 * `saved` fires after a successful write so the caller reloads its view.
 */
const emit = defineEmits<{ saved: [] }>()
const f = useStaffExtraForm(() => emit('saved'))

defineExpose({ open: (kind: StaffExtraKind, target: StaffExtraTarget) => f.open(kind, target) })
</script>
