<template>
  <div class="min-h-[100dvh] bg-background">
    <AppNavProgress />
    <AppSidebar :open="drawerOpen" @close="drawerOpen = false" />

    <div class="lg:pl-60">
      <AppHeader @toggle-sidebar="drawerOpen = true" />
      <main class="mx-auto w-full max-w-7xl p-4 md:p-6">
        <!--
          Keying the view on the active center remounts the page when the
          header's center changes, so every screen reloads its data without
          each one needing its own watcher (docs §4.3). The path is in the key
          too: /groups/1 → /groups/2 (a link on the group timeline) must load
          the other group, not keep the mounted one. Query changes don't remount.
        -->
        <RouterView :key="`center-${scope.activeCenterId ?? 'all'}:${route.path}`" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import AppNavProgress from './AppNavProgress.vue'
import { prefetchRouteChunks } from '@/shared/utils/prefetch-routes'
import AppHeader from './AppHeader.vue'
import { useScopeStore } from '@/stores/scope.store'
import { useBrandingStore } from '@/stores/branding.store'
import { useUserStore } from '@/stores/user.store'
import type { Permission } from '@/shared/enums/permission.enum'

const route = useRoute()
const router = useRouter()
const scope = useScopeStore()
const branding = useBrandingStore()
const user = useUserStore()
const drawerOpen = ref(false)

// The center list and the org brand are loaded once for the whole session, not
// per page. Branding is secondary — a failure leaves the default TalimPlus look.
onMounted(() => {
  scope.loadCenters()
  if (!branding.loaded) branding.load()
  // Download the other pages' JS in the background — the first menu click is instant.
  prefetchRouteChunks(router, (keys) => user.can(...(keys as Permission[])))
})

// Close the mobile drawer whenever navigation happens.
watch(() => route.fullPath, () => { drawerOpen.value = false })
</script>
