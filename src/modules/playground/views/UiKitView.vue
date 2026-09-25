<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  UiButton, UiInput, UiSelect, UiDatepicker, UiCheckbox, UiForm, UiModal,
  UiDropdown, UiDropdownItem, UiBadge, UiThemeToggle, UiIcon,
} from '@/shared/components'
import { Users, GraduationCap, CreditCard, MoreHorizontal, Search } from '@/shared/icons'
import { useUiKitDemo } from '../composables/use-ui-kit-demo'

const { t } = useI18n()

const { notify, modalOpen, subject, birthDate, agree, subjects, schema, onSubmit } = useUiKitDemo()

const stats = [
  { label: 'O‘quvchilar', value: '1,284', icon: Users, delta: '+4.2%' },
  { label: 'Faol guruhlar', value: '96', icon: GraduationCap, delta: '+2' },
  { label: 'Oylik tushum', value: '48.2M', icon: CreditCard, delta: '+8.1%' },
]
</script>

<template>
  <main class="mx-auto max-w-3xl space-y-6 p-8">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">TalimPlus UI kit</h1>
        <p class="text-sm text-muted-foreground">Zamonaviy, dark/light dizayn tizimi</p>
      </div>
      <UiThemeToggle />
    </header>

    <section class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div v-for="s in stats" :key="s.label" class="rounded-lg border border-border bg-surface p-4 shadow-card">
        <div class="flex items-center justify-between text-muted-foreground">
          <span class="text-xs font-medium">{{ s.label }}</span>
          <UiIcon :icon="s.icon" :size="16" />
        </div>
        <p class="mt-2 font-mono text-2xl font-semibold text-foreground">{{ s.value }}</p>
        <p class="mt-1 text-xs font-medium text-success">{{ s.delta }}</p>
      </div>
    </section>

    <div class="flex flex-wrap items-center gap-2">
      <UiButton>Primary</UiButton>
      <UiButton variant="secondary">Secondary</UiButton>
      <UiButton variant="outline">Outline</UiButton>
      <UiButton variant="ghost">Ghost</UiButton>
      <UiButton variant="danger">Danger</UiButton>
      <UiBadge variant="primary">Yangi</UiBadge>
      <UiBadge variant="success">Faol</UiBadge>
      <UiBadge variant="warning">Kutilmoqda</UiBadge>
      <UiBadge variant="danger">To‘xtatilgan</UiBadge>
    </div>

    <section class="rounded-lg border border-border bg-surface p-5 shadow-card">
      <UiForm :validation-schema="schema" class="space-y-4" @submit="onSubmit">
        <UiInput name="fullName" label="F.I.SH" placeholder="Ism familiya" required>
          <template #prefix><UiIcon :icon="Search" :size="16" /></template>
        </UiInput>
        <UiInput name="email" type="email" label="Email" placeholder="mail@example.com" required />
        <UiSelect v-model="subject" :options="subjects" label="Fan" placeholder="Fan tanlang" />
        <UiDatepicker v-model="birthDate" label="Tug‘ilgan sana" placeholder="Sanani tanlang" />
        <UiCheckbox v-model="agree" label="Shartlarga roziman" />
        <div class="flex gap-2">
          <UiButton type="submit">{{ t('common.save') }}</UiButton>
          <UiButton variant="outline" type="button" @click="modalOpen = true">Modal</UiButton>
          <UiDropdown align="right">
            <template #trigger>
              <UiButton variant="ghost" type="button"><UiIcon :icon="MoreHorizontal" :size="18" /></UiButton>
            </template>
            <UiDropdownItem @click="notify.info('Tahrirlash')">Tahrirlash</UiDropdownItem>
            <UiDropdownItem danger @click="notify.error('O‘chirildi')">O‘chirish</UiDropdownItem>
          </UiDropdown>
        </div>
      </UiForm>
    </section>

    <UiModal v-model="modalOpen" title="Namuna oyna">
      <p class="text-sm text-muted-foreground">Bu UiModal komponenti. Escape yoki fon bosilsa yopiladi.</p>
      <template #footer>
        <UiButton variant="outline" @click="modalOpen = false">{{ t('common.cancel') }}</UiButton>
        <UiButton @click="modalOpen = false">OK</UiButton>
      </template>
    </UiModal>
  </main>
</template>
