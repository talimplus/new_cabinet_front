<template>
  <div class="grid min-h-[60vh] place-items-center text-center">
    <div>
      <div class="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-surface-muted text-muted-foreground">
        <UiIcon :icon="Layers" :size="26" />
      </div>
      <h2 class="mt-4 text-xl font-bold tracking-tight text-foreground">{{ title }}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{{ t('common.comingSoon') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { UiIcon } from '@/shared/components'
import { Layers } from '@/shared/icons'

const { t } = useI18n()
const route = useRoute()
const title = computed(() =>
  route.meta.titleKey ? t(route.meta.titleKey as string) : t('common.page'),
)
</script>
