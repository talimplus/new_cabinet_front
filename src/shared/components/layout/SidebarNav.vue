<template>
  <div class="flex h-full flex-col">
    <div class="flex h-16 shrink-0 items-center gap-2.5 px-4">
      <img :src="branding.logoUrl" alt="" class="h-8 w-8 shrink-0 object-contain" />
      <span class="truncate text-base font-bold tracking-tight text-foreground">{{ branding.name }}</span>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
      <template v-for="(group, i) in groups" :key="i">
        <div
          v-if="group.labelKey"
          class="mx-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60"
          :class="i === 0 ? 'pt-1' : 'mt-2 pt-2'"
        >
          {{ t(group.labelKey!) }}
        </div>
        <SidebarLink v-for="item in group.items" :key="item.to" :item="item" @navigate="emit('navigate')" />
      </template>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useNav } from '@/shared/composables/use-nav'
import { useBrandingStore } from '@/stores/branding.store'
import SidebarLink from './SidebarLink.vue'

const emit = defineEmits<{ navigate: [] }>()

const { t } = useI18n()
const { groups } = useNav()
const branding = useBrandingStore()
</script>
