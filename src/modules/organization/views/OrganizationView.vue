<template>
  <div class="mx-auto max-w-3xl space-y-4">
    <div v-if="b.loading.value" class="grid place-items-center py-16 text-muted-foreground">
      <UiSpinner />
    </div>

    <template v-else>
      <div class="rounded-lg border border-border bg-surface shadow-card">
        <div class="border-b border-border p-5">
          <h2 class="text-lg font-bold text-foreground">{{ t('organization.brandTitle') }}</h2>
          <p class="mt-1 text-sm text-muted-foreground">{{ t('organization.brandHint') }}</p>
        </div>

        <div class="space-y-5 p-5">
          <UiInput
            v-model="b.form.name"
            :label="t('organization.name')"
            :error="b.nameError.value"
            class="max-w-md"
          />

          <div class="grid gap-5 sm:grid-cols-2">
            <BrandingImagePicker
              v-model="b.form.logoUrl"
              variant="logo"
              :label="t('organization.logo')"
              :hint="t('organization.logoHint')"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              @pick="(f) => b.pickFile(f, MAX_LOGO_BYTES, 'logoUrl')"
            />
            <BrandingImagePicker
              v-model="b.form.faviconUrl"
              variant="favicon"
              :label="t('organization.favicon')"
              :hint="t('organization.faviconHint')"
              accept="image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
              @pick="(f) => b.pickFile(f, MAX_FAVICON_BYTES, 'faviconUrl')"
            />
          </div>

          <p v-if="b.fileError.value" class="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {{ b.fileError.value }}
          </p>
        </div>

        <div class="flex justify-end gap-2 border-t border-border p-5">
          <UiButton variant="outline" :disabled="!b.isDirty.value || b.saving.value" @click="b.reset">
            {{ t('common.cancel') }}
          </UiButton>
          <UiButton :loading="b.saving.value" :disabled="!b.isDirty.value || !!b.nameError.value" @click="b.save">
            {{ t('common.save') }}
          </UiButton>
        </div>
      </div>

      <p class="rounded-md bg-info-soft px-3 py-2 text-sm text-info">{{ t('organization.domainNote') }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiInput, UiButton, UiSpinner } from '@/shared/components'
import {
  useOrganizationBranding,
  MAX_LOGO_BYTES,
  MAX_FAVICON_BYTES,
} from '../composables/use-organization-branding'
import BrandingImagePicker from '../components/BrandingImagePicker.vue'

const { t } = useI18n()
const b = useOrganizationBranding()
onMounted(b.load)
</script>
