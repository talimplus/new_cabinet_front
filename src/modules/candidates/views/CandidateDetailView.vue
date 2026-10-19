<template>
  <div class="mx-auto max-w-4xl space-y-4">
    <div class="flex items-center gap-3">
      <UiBackButton :fallback="{ name: 'candidates' }" />
      <h1 class="min-w-0 flex-1 truncate text-lg font-bold text-foreground">
        {{ fullName || t('layout.titles.candidate') }}
      </h1>
      <UiButton v-if="canManageCandidates && d.candidate.value" variant="outline" @click="d.modalOpen.value = true">
        <UiIcon :icon="Pencil" :size="16" /> {{ t('common.edit') }}
      </UiButton>
    </div>

    <div v-if="d.loading.value && !d.candidate.value" class="p-8 text-center">
      <UiSpinner :size="24" class="mx-auto text-muted-foreground" />
    </div>
    <p v-else-if="d.failed.value" class="p-8 text-center text-sm text-muted-foreground">
      {{ t('candidates.detail.notFound') }}
    </p>
    <CandidateInfoCard v-else-if="d.candidate.value" :candidate="d.candidate.value" />

    <CandidateFormModal
      v-if="canManageCandidates"
      ref="modalRef"
      v-model="d.modalOpen.value"
      :editing="d.candidate.value"
      :default-center-id="d.candidate.value?.centerId ?? null"
      :subjects="d.subjects.value"
      :loading="saving"
      @submit="onSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { GenericObject } from 'vee-validate'
import { UiButton, UiIcon, UiBackButton, UiSpinner } from '@/shared/components'
import { Pencil } from '@/shared/icons'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useCandidateDetail } from '../composables/use-candidate-detail'
import { toCandidateForm } from '../composables/use-candidate-schema'
import CandidateInfoCard from '../components/CandidateInfoCard.vue'
import CandidateFormModal from '../components/CandidateFormModal.vue'

const { t } = useI18n()
const route = useRoute()
const { canManageCandidates } = usePermissions()
const d = useCandidateDetail(() => Number(route.params.id))
onMounted(d.init)

const modalRef = ref<{ setBackendErrors: (err: unknown) => void } | null>(null)
const saving = ref(false)
const fullName = computed(() => {
  const c = d.candidate.value
  return c ? `${c.lastName} ${c.firstName}`.trim() : ''
})

async function onSubmit(values: GenericObject) {
  saving.value = true
  try {
    await d.submit(toCandidateForm(values))
  } catch (error) {
    modalRef.value?.setBackendErrors(error)
  } finally {
    saving.value = false
  }
}
</script>
