<template>
  <div class="flex justify-end gap-1">
    <!-- Vaqtincha: xodimlar qator bosilishiga o'rgangach Eye olib tashlanadi. -->
    <UiIconButton v-if="canView" :icon="Eye" tone="primary" :label="t('common.view')" @click="emit('view')" />
    <!-- A dismissed employee is read-only: only their history and "take back". -->
    <template v-if="dismissed">
      <UiIconButton v-if="canEdit" :icon="RotateCcw" tone="success" :label="t('users.reinstate.action')" @click="emit('reinstate')" />
    </template>
    <template v-else>
      <UserExtraButtons v-if="canPay && user.isActive !== false" @advance="emit('advance')" @bonus="emit('bonus')" />
      <UiIconButton v-if="canEdit" :icon="Pencil" tone="primary" :label="t('common.edit')" @click="emit('edit')" />
      <template v-if="canEdit && manageable">
        <UiIconButton
          :icon="user.isActive === false ? UserCheck : Ban"
          :tone="user.isActive === false ? 'success' : 'danger'"
          :label="user.isActive === false ? t('users.unblock') : t('users.block')"
          @click="emit('toggleActive')"
        />
        <UiIconButton :icon="UserX" tone="danger" :label="t('users.dismiss.action')" @click="emit('dismiss')" />
      </template>
      <UiIconButton v-if="canDelete" :icon="Trash2" tone="danger" :label="t('common.delete')" @click="emit('delete')" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiIconButton } from '@/shared/components'
import { Pencil, Trash2, Eye, Ban, UserCheck, UserX, RotateCcw } from '@/shared/icons'
import { UserRole } from '@/shared/enums/user-role.enum'
import UserExtraButtons from './UserExtraButtons.vue'
import type { User } from '../interfaces/user.interface'

const { t } = useI18n()

const props = defineProps<{
  user: User
  canView?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canPay?: boolean
  selfId?: number | null
}>()
const emit = defineEmits<{
  view: []; edit: []; delete: []; toggleActive: []; dismiss: []; reinstate: []; advance: []; bonus: []
}>()

const dismissed = computed(() => !!props.user.dismissedAt)
/** Nobody blocks/dismisses the owner or themself. */
const manageable = computed(() => props.user.role !== UserRole.ADMIN && props.user.id !== props.selfId)
</script>
