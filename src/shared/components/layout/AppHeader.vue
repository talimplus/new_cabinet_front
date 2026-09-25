<template>
  <header
    class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md md:px-6"
  >
    <button
      class="-ml-1 inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-surface-muted lg:hidden"
      :aria-label="t('layout.menuToggle')"
      @click="emit('toggle-sidebar')"
    >
      <UiIcon :icon="Menu" :size="22" />
    </button>

    <!--
      Hidden below `sm`: at phone width the center switcher, language, theme and
      account controls already fill the bar, and the sidebar marks the active page.
    -->
    <h1 class="hidden truncate text-base font-semibold text-foreground sm:block">{{ title }}</h1>

    <div class="ml-auto flex min-w-0 items-center gap-1">
      <AppCenterSwitcher />
      <UiLocaleToggle />
      <UiThemeToggle />
      <UiDropdown align="right">
        <template #trigger>
          <button class="flex h-11 items-center gap-2 rounded-md px-2 hover:bg-surface-muted lg:h-10">
            <span class="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-xs font-bold text-on-primary-soft">
              {{ initials }}
            </span>
            <span class="hidden min-w-0 flex-col text-left leading-tight sm:flex">
              <span class="max-w-[10rem] truncate text-sm text-foreground">{{ user?.email }}</span>
              <span v-if="roleLabel" class="max-w-[10rem] truncate text-xs text-muted-foreground">{{ roleLabel }}</span>
            </span>
          </button>
        </template>
        <!-- Phones hide the email/role in the trigger, so show them atop the menu. -->
        <div class="mb-1 border-b border-border px-3 py-2 sm:hidden">
          <p class="truncate text-sm font-medium text-foreground">{{ user?.email }}</p>
          <p v-if="roleLabel" class="truncate text-xs text-muted-foreground">{{ roleLabel }}</p>
        </div>
        <UiDropdownItem @click="router.push('/profile')">
          <UiIcon :icon="User" :size="16" /> {{ t('layout.profile') }}
        </UiDropdownItem>
        <UiDropdownItem danger @click="onLogout">
          <UiIcon :icon="LogOut" :size="16" /> {{ t('layout.logout') }}
        </UiDropdownItem>
      </UiDropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  UiDropdown, UiDropdownItem, UiThemeToggle, UiLocaleToggle, UiIcon,
} from '@/shared/components'
import { Menu, LogOut, User } from '@/shared/icons'
import AppCenterSwitcher from './AppCenterSwitcher.vue'
import { useUserStore } from '@/stores/user.store'
import { USER_ROLE_LABEL_KEYS } from '@/shared/enums/user-role.enum'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const emit = defineEmits<{ 'toggle-sidebar': [] }>()

const title = computed(() =>
  route.meta.titleKey ? t(route.meta.titleKey as string) : 'TalimPlus',
)
const user = computed(() => userStore.user)
const initials = computed(() => user.value?.email?.slice(0, 2).toUpperCase() ?? '')
/** Admin-chosen role name ("Kassir"…) first, else the base role type (old cabinet_front). */
const roleLabel = computed(() => {
  const u = user.value
  if (!u) return ''
  return u.roleName || (u.role ? t(USER_ROLE_LABEL_KEYS[u.role]) : '')
})

async function onLogout() {
  await userStore.logout()
  await router.replace('/login')
}
</script>
