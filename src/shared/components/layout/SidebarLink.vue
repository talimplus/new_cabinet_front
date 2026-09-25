<template>
  <RouterLink v-slot="{ href, navigate, isActive, isExactActive }" :to="item.to" custom>
    <a
      :href="href"
      :class="cn(base, active(isActive, isExactActive) ? activeCls : idleCls)"
      @click="(e) => { navigate(e); emit('navigate') }"
    >
      <span
        v-if="active(isActive, isExactActive)"
        class="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-brand"
      />
      <UiIcon :icon="item.icon" :size="20" />
      <span class="truncate">{{ t(item.labelKey) }}</span>
    </a>
  </RouterLink>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { cn } from '@/shared/utils/cn'
import UiIcon from '@/shared/components/UiIcon.vue'
import type { NavItem } from '@/shared/interfaces/nav-item.interface'

const { t } = useI18n()

const props = defineProps<{ item: NavItem }>()
const emit = defineEmits<{ navigate: [] }>()

// Dashboard ('/') matches exactly; other items stay active on nested routes.
function active(isActive: boolean, isExactActive: boolean): boolean {
  return props.item.to === '/' ? isExactActive : isActive
}

const base =
  'relative flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors lg:h-9'
const activeCls = 'bg-primary-soft font-semibold text-on-primary-soft'
const idleCls = 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
</script>
