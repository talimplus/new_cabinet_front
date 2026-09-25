<template>
  <UiModal :model-value="modelValue" :title="t('students.dialog.reasonTitle')" size="sm" @update:model-value="emit('update:modelValue', $event)">
    <div class="space-y-4">
      <UiSelect
        :model-value="likelihood"
        :options="options"
        :label="t('students.dialog.returnTitle')"
        :searchable="false"
        @update:model-value="likelihood = ($event as ReturnLikelihood | null)"
      />
      <UiTextarea v-model="comment" :label="t('students.dialog.comment')" :rows="3" />
    </div>
    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton @click="onConfirm">{{ t('common.confirm') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiSelect, UiTextarea, UiButton } from '@/shared/components'
import { ReturnLikelihood, RETURN_LIKELIHOOD_LABEL_KEYS } from '../enums/return-likelihood.enum'

const { t } = useI18n()

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [payload: { returnLikelihood?: ReturnLikelihood; comment?: string }]
}>()

const likelihood = ref<ReturnLikelihood | null>(null)
const comment = ref('')
const options = computed(() =>
  Object.values(ReturnLikelihood).map((v) => ({ label: t(RETURN_LIKELIHOOD_LABEL_KEYS[v]), value: v })),
)

watch(() => props.modelValue, (open) => {
  if (open) { likelihood.value = null; comment.value = '' }
})

function onConfirm() {
  emit('confirm', {
    returnLikelihood: likelihood.value ?? undefined,
    comment: comment.value.trim() || undefined,
  })
}
</script>
