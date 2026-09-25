<template>
  <div class="mx-auto max-w-3xl">
    <div v-if="p.loading.value && !p.profile.value" class="grid place-items-center py-16 text-muted-foreground">
      <UiSpinner />
      <p class="mt-3 text-sm">{{ t('profile.loadingProfile') }}</p>
    </div>

    <div v-else-if="p.profile.value" class="rounded-lg border border-border bg-surface shadow-card">
      <div class="flex items-center gap-4 border-b border-border p-5">
        <span class="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary-soft text-lg font-bold text-on-primary-soft">
          {{ initials }}
        </span>
        <div class="min-w-0">
          <h2 class="truncate text-lg font-bold text-foreground">
            {{ p.profile.value.firstName }} {{ p.profile.value.lastName }}
          </h2>
          <p class="truncate text-sm text-muted-foreground">{{ roleLabel }}</p>
        </div>
      </div>

      <div class="p-5">
        <ProfileForm
          ref="formRef"
          :form-key="formKey"
          :schema="p.schema.value"
          :initial-values="p.initialValues.value"
          :is-teacher="p.isTeacher.value"
          :salary="p.profile.value.salary"
          :commission-percentage="p.profile.value.commissionPercentage"
          :loading="p.saving.value"
          :is-dirty="p.isDirty"
          @submit="onSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GenericObject } from 'vee-validate'
import { UiSpinner } from '@/shared/components'
import { useProfile } from '../composables/use-profile'
import ProfileForm from '../components/ProfileForm.vue'

const { t } = useI18n()
const p = useProfile()
onMounted(p.load)

const formRef = ref<{ setBackendErrors: (e: unknown) => void } | null>(null)

const initials = computed(() => {
  const u = p.profile.value
  return u ? `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase() : ''
})
const roleLabel = computed(() => p.profile.value?.roleName ?? '')
const formKey = computed(() => `profile-${p.profile.value?.id ?? 'loading'}`)

async function onSubmit(values: GenericObject) {
  try {
    await p.submit(values)
  } catch (error) {
    formRef.value?.setBackendErrors(error)
  }
}
</script>
