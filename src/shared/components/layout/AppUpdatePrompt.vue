<template>
  <Teleport to="body">
    <Transition name="app-update">
      <div
        v-if="available"
        role="status"
        class="fixed right-4 bottom-4 z-[60] w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-surface-2 shadow-popover"
      >
        <div class="h-1 bg-brand" />
        <div class="flex items-start gap-3 p-4">
          <span class="app-update-icon flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-on-primary-soft">
            <UiIcon :icon="Sparkles" :size="18" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-foreground">{{ t('common.update.title') }}</p>
            <p class="mt-0.5 text-sm text-muted-foreground">{{ t('common.update.message') }}</p>
            <div class="mt-3 flex gap-2">
              <UiButton size="sm" @click="reload">
                <UiIcon :icon="RefreshCw" :size="14" />
                {{ t('common.update.reload') }}
              </UiButton>
              <UiButton size="sm" variant="ghost" @click="later">{{ t('common.update.later') }}</UiButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RefreshCw, Sparkles } from '@/shared/icons'
import { useAppUpdate } from '@/shared/composables/use-app-update'
import UiButton from '../UiButton.vue'
import UiIcon from '../UiIcon.vue'

const { t } = useI18n()
const { available, later, reload } = useAppUpdate()
</script>

<style scoped>
.app-update-enter-active {
  transition: opacity 0.35s ease, transform 0.45s cubic-bezier(0.22, 1.2, 0.36, 1);
}
.app-update-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.app-update-enter-from,
.app-update-leave-to {
  opacity: 0;
  transform: translateY(1.5rem) scale(0.96);
}
.app-update-icon {
  animation: app-update-pulse 2s ease-in-out infinite;
}
@keyframes app-update-pulse {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in oklab, var(--color-primary) 35%, transparent); }
  50% { box-shadow: 0 0 0 6px transparent; }
}
@media (prefers-reduced-motion: reduce) {
  .app-update-enter-active, .app-update-leave-active { transition: opacity 0.2s ease; }
  .app-update-enter-from, .app-update-leave-to { transform: none; }
  .app-update-icon { animation: none; }
}
</style>
