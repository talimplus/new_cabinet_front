<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      <TransitionGroup name="ui-toast">
        <div
          v-for="n in store.items"
          :key="n.id"
          :class="cn('flex items-start gap-3 rounded-lg border bg-surface-2 p-3 shadow-popover', accents[n.type])"
          role="alert"
        >
          <component :is="icons[n.type]" :size="18" class="mt-0.5 shrink-0" />
          <p class="flex-1 text-sm text-foreground">{{ n.message }}</p>
          <button class="text-muted-foreground hover:text-foreground" @click="store.remove(n.id)">
            <X :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from '@/shared/icons'
import { cn } from '@/shared/utils/cn'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'

const store = useNotificationStore()

const icons = {
  [NotificationType.SUCCESS]: CheckCircle2,
  [NotificationType.ERROR]: XCircle,
  [NotificationType.WARNING]: AlertTriangle,
  [NotificationType.INFO]: Info,
}

const accents: Record<NotificationType, string> = {
  [NotificationType.SUCCESS]: 'border-l-4 border-l-success border-border text-success',
  [NotificationType.ERROR]: 'border-l-4 border-l-danger border-border text-danger',
  [NotificationType.WARNING]: 'border-l-4 border-l-warning border-border text-warning',
  [NotificationType.INFO]: 'border-l-4 border-l-info border-border text-info',
}
</script>

<style scoped>
.ui-toast-enter-active,
.ui-toast-leave-active {
  transition: all 0.25s ease;
}
.ui-toast-enter-from,
.ui-toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
