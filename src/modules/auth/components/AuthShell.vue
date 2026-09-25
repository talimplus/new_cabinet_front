<template>
  <main class="grid min-h-[100dvh] place-items-center bg-background p-4">
    <div class="w-full max-w-sm">
      <div class="mb-6 flex flex-col items-center gap-3 text-center">
        <img src="/favicon.svg" alt="TalimPlus" class="h-11 w-11" />
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground">{{ title }}</h1>
          <p v-if="subtitle" class="mt-1 text-sm text-muted-foreground">{{ subtitle }}</p>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-surface p-6 shadow-card">
        <slot />
      </div>

      <p v-if="$slots.footer" class="mt-4 text-center text-sm text-muted-foreground">
        <slot name="footer" />
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()
</script>
