<template>
  <UiModal
    :model-value="!!state.target"
    :title="t('users.dismiss.title')"
    size="sm"
    :close-on-overlay="!state.saving"
    @update:model-value="emit('close')"
  >
    <div class="space-y-4">
      <p class="text-sm text-foreground">{{ t('users.dismiss.question', { name }) }}</p>
      <ul class="list-disc space-y-1 rounded-md bg-warning-soft py-2 pr-3 pl-7 text-xs text-warning">
        <li>{{ t('users.dismiss.noLogin') }}</li>
        <li>{{ t('users.dismiss.historyKept') }}</li>
        <li v-if="isTeacher">{{ t('users.dismiss.teacherGroups') }}</li>
      </ul>
      <UiDatepicker
        v-model="state.date"
        :enable-time="false"
        :clearable="false"
        :max-date="new Date()"
        :label="t('users.dismiss.date')"
        :hint="t('users.dismiss.dateHint')"
        :error="state.errors.dismissedAt"
      />
      <UiTextarea v-model="state.reason" :label="t('users.dismiss.reason')" :rows="2" :error="state.errors.reason" />
    </div>
    <template #footer>
      <UiButton variant="ghost" :disabled="state.saving" @click="emit('close')">{{ t('common.cancel') }}</UiButton>
      <UiButton variant="danger" :loading="state.saving" :disabled="!state.date" @click="emit('confirm')">
        {{ t('users.dismiss.confirm') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiDatepicker, UiModal, UiTextarea } from '@/shared/components'
import { UserRole } from '@/shared/enums/user-role.enum'
import type { useUserDismiss } from '../composables/use-user-dismiss'

const { t } = useI18n()

/** `state` is the composable's reactive object, so v-model writes flow back. */
const props = defineProps<{ state: ReturnType<typeof useUserDismiss>['state'] }>()
const emit = defineEmits<{ close: []; confirm: [] }>()

const name = computed(() => (props.state.target ? `${props.state.target.firstName} ${props.state.target.lastName}` : ''))
const isTeacher = computed(() => props.state.target?.role === UserRole.TEACHER)
</script>
