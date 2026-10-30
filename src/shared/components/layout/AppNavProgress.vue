<template>
  <!-- Instant feedback on a menu click while the page (or its guard) loads. -->
  <div v-if="active" class="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden" role="progressbar" aria-hidden="true">
    <div class="nav-progress h-full w-1/3 bg-primary" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const active = ref(false)
let timer: number | undefined

// Shown only if navigation takes > 120 ms — instant ones don't flash a bar.
const stopStart = router.beforeEach(() => {
  window.clearTimeout(timer)
  timer = window.setTimeout(() => { active.value = true }, 120)
})
const done = (): void => {
  window.clearTimeout(timer)
  active.value = false
}
const stopEnd = router.afterEach(done)
const stopError = router.onError(done)

onBeforeUnmount(() => {
  stopStart()
  stopEnd()
  stopError()
  done()
})
</script>

<style scoped>
.nav-progress {
  animation: nav-progress 1s ease-in-out infinite;
}
@keyframes nav-progress {
  from { transform: translateX(-100%); }
  to { transform: translateX(300%); }
}
</style>
