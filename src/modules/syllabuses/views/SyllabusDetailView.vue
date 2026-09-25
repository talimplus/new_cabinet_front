<script setup lang="ts">
import { onMounted } from 'vue'
import { UiButton, UiBadge, UiIcon, UiIconButton, UiSpinner } from '@/shared/components'
import { ArrowLeft, Plus, BookOpen, Pencil } from '@/shared/icons'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useSyllabusDetail } from '../composables/use-syllabus-detail'
import TopicList from '../components/topics/TopicList.vue'
import AddTopicDialog from '../components/topics/AddTopicDialog.vue'
import TopicEditorDrawer from '../components/topics/TopicEditorDrawer.vue'
import SyllabusFormModal from '../components/SyllabusFormModal.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { canManageSyllabus } = usePermissions()
const s = useSyllabusDetail()
onMounted(s.load)
</script>

<template>
  <div v-if="s.loading.value && !s.syllabus.value" class="flex justify-center py-16">
    <UiSpinner :size="28" />
  </div>

  <div v-else-if="s.syllabus.value" class="space-y-4">
    <header class="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4">
      <RouterLink
        to="/syllabuses"
        class="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-muted md:size-9"
        :aria-label="t('syllabuses.back')"
      >
        <UiIcon :icon="ArrowLeft" :size="18" />
      </RouterLink>
      <div class="min-w-0 flex-1">
        <h1 class="truncate text-lg font-bold text-foreground">{{ s.syllabus.value.name }}</h1>
        <p v-if="s.syllabus.value.description" class="mt-0.5 text-sm text-muted-foreground">
          {{ s.syllabus.value.description }}
        </p>
      </div>
      <UiBadge variant="primary">
        <UiIcon :icon="BookOpen" :size="13" /> {{ s.syllabus.value.subject.name }}
      </UiBadge>
      <UiIconButton
        v-if="canManageSyllabus"
        :icon="Pencil"
        tone="primary"
        :label="t('syllabuses.editTitle')"
        @click="s.openEditSyllabus"
      />
    </header>

    <section class="rounded-lg border border-border bg-surface p-4">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="font-semibold text-foreground">
          {{ t('syllabuses.editor.topics') }}
          <span class="text-muted-foreground">({{ s.topics.value.length }})</span>
        </h2>
        <UiButton v-if="canManageSyllabus" size="sm" @click="s.openAdd">
          <UiIcon :icon="Plus" :size="16" /> {{ t('syllabuses.editor.addTopic') }}
        </UiButton>
      </div>

      <TopicList :topics="s.topics.value" :editable="canManageSyllabus" @open="s.openEditor" @reorder="s.reorder" />
    </section>

    <AddTopicDialog v-model="s.addOpen.value" @submit="s.submitAddTopic" />
    <TopicEditorDrawer
      v-model="s.editorOpen.value"
      :syllabus-id="s.syllabusId.value"
      :topic="s.selectedTopic.value"
      :readonly="!canManageSyllabus"
      @saved="s.load"
      @deleted="s.load"
    />
    <SyllabusFormModal
      v-model="s.editOpen.value"
      :subjects="s.subjectOptions.value"
      :editing="s.syllabus.value"
      @saved="s.load"
    />
  </div>
</template>
