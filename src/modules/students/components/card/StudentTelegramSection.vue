<template>
  <StudentTelegramCard
    :link="tg.link.value"
    :active="tg.active.value"
    :blocked="tg.blocked.value"
    :loading="tg.loading.value"
    :can-edit="canEdit"
    :unlinking-id="tg.unlinkingId.value"
    @copy="tg.copyLink"
    @download="tg.downloadQr(studentName)"
    @regenerate-request="tg.confirmOpen.value = true"
    @unlink="tg.unlink"
  />

  <TelegramRegenerateDialog
    :open="tg.confirmOpen.value"
    :loading="tg.regenerating.value"
    @close="tg.confirmOpen.value = false"
    @confirm="tg.regenerate"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTelegramParent } from '../../composables/use-telegram-parent'
import StudentTelegramCard from './StudentTelegramCard.vue'
import TelegramRegenerateDialog from './TelegramRegenerateDialog.vue'

/** Self-contained: the parent-bot card only ever needs the student's id. */
const props = defineProps<{ studentId: number | null; studentName: string; canEdit?: boolean }>()

const tg = useTelegramParent(() => props.studentId)
onMounted(tg.load)
</script>
