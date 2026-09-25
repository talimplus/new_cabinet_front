<template>
  <div class="min-h-[100dvh] bg-background">
    <AppSidebar :open="drawerOpen" @close="drawerOpen = false" />

    <div class="lg:pl-60">
      <AppHeader @toggle-sidebar="drawerOpen = true" />
      <main class="mx-auto w-full max-w-7xl p-4 md:p-6">
        <!--
          Keying the view on the active center remounts the page when the
          header's center changes, so every screen reloads its data without
          each one needing its own watcher (docs §4.3).
        -->
        <RouterView :key="`center-${scope.activeCenterId ?? 'all'}`" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { useScopeStore } from '@/stores/scope.store'
import { useBrandingStore } from '@/stores/branding.store'

const route = useRoute()
const scope = useScopeStore()
const branding = useBrandingStore()
const drawerOpen = ref(false)

// The center list and the org brand are loaded once for the whole session, not
// per page. Branding is secondary — a failure leaves the default TalimPlus look.
onMounted(() => {
  scope.loadCenters()
  if (!branding.loaded) branding.load()
})

// Close the mobile drawer whenever navigation happens.
watch(() => route.fullPath, () => { drawerOpen.value = false })
</script>
