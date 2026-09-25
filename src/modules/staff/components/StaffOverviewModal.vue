<template>
  <UiModal
    :model-value="open"
    :title="t('staff.title')"
    size="xl"
    @update:model-value="emit('close')"
  >
    <!-- Keyed so reopening for another employee always refetches. -->
    <StaffOverviewCard
      v-if="open && userId"
      :key="`${userId}-${month}`"
      :user-id="userId"
      :month="month"
      show-actions
      @changed="emit('changed')"
    />
  </UiModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiModal } from '@/shared/components'
import StaffOverviewCard from './StaffOverviewCard.vue'

const { t } = useI18n()

defineProps<{ open: boolean; userId: number | null; month: string }>()
const emit = defineEmits<{ close: []; changed: [] }>()
</script>
