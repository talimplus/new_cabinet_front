<template>
  <section class="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
    <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
      <span class="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft font-mono text-xs text-on-primary-soft">
        {{ n }}
      </span>
      {{ title }}
    </h2>
    <slot />
  </section>
</template>

<script setup lang="ts">
/** One numbered step of the salary breakdown ("1) Ustama qayerdan keldi"). */
defineProps<{ n: number; title: string }>()
</script>
