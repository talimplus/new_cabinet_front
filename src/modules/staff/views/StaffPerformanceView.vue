<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { UiIconButton } from '@/shared/components'
import { ArrowLeft } from '@/shared/icons'
import StaffOverviewCard from '../components/StaffOverviewCard.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// With an `:id` param this is another employee's page (`/users/:id`); without
// one it is my own (`/my-performance`, userId = null) — a page every employee opens.
const staffId = computed(() => {
  const raw = route.params.id
  const id = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isFinite(id) && id > 0 ? id : null
})
</script>

<template>
  <div class="space-y-4">
    <div v-if="staffId" class="flex items-center gap-3">
      <UiIconButton :icon="ArrowLeft" :label="t('common.back')" @click="router.back()" />
      <h1 class="text-lg font-bold text-foreground">{{ t('staff.title') }}</h1>
    </div>
    <!-- Own page never shows pay/fine actions (an owner never fines themself). -->
    <StaffOverviewCard :key="staffId ?? 'me'" :user-id="staffId" :show-actions="!!staffId" />
  </div>
</template>
