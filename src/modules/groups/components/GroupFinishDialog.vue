<template>
  <UiModal :model-value="f.state.open" :title="t('groups.finish.title', { name: f.state.group?.name ?? '' })" size="lg" :close-on-overlay="!f.saving.value" @update:model-value="f.state.open = $event">
    <div class="space-y-4">
      <UiDatepicker v-model="f.state.endDate" :enable-time="false" :clearable="false" :max-date="new Date()" :min-date="branding.openedOn" :label="t('groups.finish.endDate')" :hint="t('groups.finish.endDateHint')" />
      <UiSpinner v-if="f.loading.value" class="mx-auto" />
      <template v-else-if="f.members.value.length">
        <div v-if="f.canMove.value" class="flex items-center gap-2 text-sm text-foreground">
          <UiSwitch v-model="f.state.move" :label="t('groups.finish.moveStudents')" />{{ t('groups.finish.moveStudents') }}
        </div>
        <template v-if="f.state.move && f.canMove.value">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
            <UiSelect v-model="f.state.targetGroupId" :options="f.groupOptions.value" :label="t('groups.finish.targetGroup')" class="min-w-0 flex-1" />
            <UiButton v-if="f.canCreate.value" variant="outline" @click="f.state.createOpen = true">{{ t('groups.finish.createGroup') }}</UiButton>
          </div>
          <GroupFinishStudents :members="f.members.value" :selected="f.selected.value" @toggle="f.toggle" @toggle-all="f.toggleAll" />
        </template>
      </template>
      <p class="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
        {{ t('groups.finish.summary', { moved: f.moving.value, finished: f.finishing.value }) }}
        <template v-if="f.debtStaying.value > 0"> {{ t('groups.finish.debtStays', { amount: formatSom(f.debtStaying.value) }) }}</template>
      </p>
    </div>
    <template #footer>
      <UiButton variant="outline" :disabled="f.saving.value" @click="f.state.open = false">{{ t('common.cancel') }}</UiButton>
      <UiButton variant="danger" :loading="f.saving.value" :disabled="!f.canSubmit.value" @click="f.submit">{{ t('groups.finish.confirm') }}</UiButton>
    </template>
  </UiModal>

  <GroupFormModal ref="formRef" v-model="f.state.createOpen" :editing="null" :template="f.template.value" :default-center-id="f.state.group?.center?.id ?? null" :loading="creating" @submit="onCreate" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiDatepicker, UiSpinner, UiSwitch, UiSelect, UiButton } from '@/shared/components'
import GroupFinishStudents from './GroupFinishStudents.vue'
import GroupFormModal from './GroupFormModal.vue'
import { useGroupFinish } from '../composables/use-group-finish'
import { useBrandingStore } from '@/stores/branding.store'
import { formatSom } from '@/shared/utils/format-money'
import type { Group } from '../interfaces/group.interface'
import type { GroupForm } from '../interfaces/group-form.interface'

const { t } = useI18n()
const branding = useBrandingStore()

const emit = defineEmits<{ done: [] }>()
const f = useGroupFinish(() => emit('done'))

const formRef = ref<{ setBackendErrors: (e: unknown) => void } | null>(null)
const creating = ref(false)
async function onCreate(form: GroupForm): Promise<void> {
  creating.value = true
  try {
    await f.createTarget(form)
  } catch (error) {
    formRef.value?.setBackendErrors(error)
  } finally {
    creating.value = false
  }
}

defineExpose({ open: (group: Group) => f.open(group) })
</script>
