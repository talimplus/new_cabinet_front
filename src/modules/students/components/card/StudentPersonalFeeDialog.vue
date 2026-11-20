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
        {{ t('students.personalFee.hint', { amount: formatSom(f.preview.value?.personalFee ?? 0) }) }}
      </p>
      <UiSelect
        :model-value="f.state.month"
        :options="f.monthOptions.value"
        :label="t('students.personalFee.fromMonth')"
        :hint="t('students.personalFee.fromMonthHint')"
        :error="f.error.value"
        :clearable="false"
        :searchable="false"
        @update:model-value="f.pickMonth(typeof $event === 'string' ? $event : null)"
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
import { useI18n } from 'vue-i18n'
import { UiModal, UiSelect, UiButton } from '@/shared/components'
import BackdateImpact from '@/shared/components/backdate/BackdateImpact.vue'
import { formatSom } from '@/shared/utils/format-money'
import { useStudentPersonalFee } from '../../composables/use-student-personal-fee'

const { t } = useI18n()
const emit = defineEmits<{ done: [] }>()
const f = useStudentPersonalFee(() => emit('done'))

defineExpose({ open: (studentId: number) => f.open(studentId) })
</script>
