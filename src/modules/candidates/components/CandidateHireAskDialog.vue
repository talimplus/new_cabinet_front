<template>
  <UiModal :model-value="!!candidate" :title="t('candidates.hire.askTitle')" size="sm" @update:model-value="emit('cancel')">
    <p class="text-sm text-foreground">{{ t('candidates.hire.askText', { name }) }}</p>
    <p class="mt-2 text-xs text-muted-foreground">{{ t('candidates.hire.askHint') }}</p>
    <template #footer>
      <UiButton variant="ghost" @click="emit('cancel')">{{ t('common.cancel') }}</UiButton>
      <UiButton variant="outline" @click="emit('no')">{{ t('candidates.hire.no') }}</UiButton>
      <UiButton @click="emit('yes')">{{ t('candidates.hire.yes') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiButton } from '@/shared/components'
import type { Candidate } from '../interfaces/candidate.interface'

const { t } = useI18n()
const props = defineProps<{ candidate: Candidate | null }>()
const emit = defineEmits<{ yes: []; no: []; cancel: [] }>()
const name = computed(() => (props.candidate ? `${props.candidate.lastName} ${props.candidate.firstName}` : ''))
</script>
