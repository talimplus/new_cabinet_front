<template>
  <UiModal :model-value="form.open" :title="t(PAYROLL_EXTRA_TITLE_KEYS[form.kind])" size="sm" @update:model-value="emit('close')">
    <div v-if="form.staff" class="space-y-3">
      <p class="rounded-md bg-surface-muted px-3 py-2 text-sm">
        <span class="text-muted-foreground">{{ t('payroll.extras.worker') }}:</span>
        <span class="font-medium"> {{ form.staff.user.firstName }} {{ form.staff.user.lastName }}</span>
      </p>
      <p :class="cn('rounded-md px-3 py-2 text-xs', isBonus ? 'bg-success-soft text-success' : 'bg-info-soft text-info')">
        {{ t(isBonus ? 'payroll.extras.bonusHint' : 'payroll.extras.advanceHint') }}
      </p>

      <UiMoneyInput
        :model-value="form.amount ?? ''"
        :label="t('payroll.extras.amount')"
        :error="form.errors.amount"
        :disabled="form.saving"
        required
        @update:model-value="emit('change', { amount: $event === '' ? null : Number($event) })"
      />
      <UiInput
        :model-value="form.forMonth"
        type="month"
        :label="t(isBonus ? 'payroll.extras.bonusMonth' : 'payroll.extras.advanceMonth')"
        :error="form.errors.forMonth"
        :disabled="form.saving"
        required
        @update:model-value="emit('change', { forMonth: String($event) })"
      />
      <UiTextarea
        :model-value="form.text"
        :label="t(isBonus ? 'payroll.extras.reason' : 'payroll.extras.comment')"
        :hint="t('payroll.extras.reasonHint')"
        :error="form.errors.reason"
        :rows="2"
        :required="isBonus"
        :disabled="form.saving"
        @update:model-value="emit('change', { text: $event })"
      />
    </div>

    <template #footer>
      <UiButton variant="ghost" :disabled="form.saving" @click="emit('close')">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="form.saving" @click="emit('submit')">{{ t('common.save') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiMoneyInput, UiInput, UiTextarea, UiButton } from '@/shared/components'
import { cn } from '@/shared/utils/cn'
import { PayrollExtraKind, PAYROLL_EXTRA_TITLE_KEYS } from '../enums/payroll-extra-kind.enum'
import type { PayrollExtraPatch, PayrollExtraState } from '../composables/use-payroll-extras'

const { t } = useI18n()

/** `form` is the composable's state; edits go back through `change`. */
const props = defineProps<{ form: PayrollExtraState }>()
const emit = defineEmits<{ close: []; submit: []; change: [patch: PayrollExtraPatch] }>()

const isBonus = computed(() => props.form.kind === PayrollExtraKind.BONUS)
</script>
