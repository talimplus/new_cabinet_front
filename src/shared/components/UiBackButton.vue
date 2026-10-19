<template>
  <UiIconButton :icon="ArrowLeft" :label="label ?? t('common.back')" @click="goBack" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter, type RouteLocationRaw } from 'vue-router'
import { ArrowLeft } from '@/shared/icons'
import UiIconButton from './UiIconButton.vue'

interface Props {
  /** Where to go when there is no in-app page to return to (opened from a link / new tab). */
  fallback: RouteLocationRaw
  label?: string
}

const props = defineProps<Props>()
const { t } = useI18n()
const router = useRouter()

/**
 * Inside the app go to the page we came from (a group → its student → back to
 * the group). vue-router records that page in `history.state.back`; without it
 * `router.back()` would leave the cabinet, so the fallback list opens instead.
 */
function goBack(): void {
  if (window.history.state?.back) router.back()
  else void router.push(props.fallback)
}
</script>
