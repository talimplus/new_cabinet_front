<template>
  <div class="flex" :class="isUser ? 'justify-end' : 'justify-start'">
    <div
      class="max-w-[82%] rounded-lg px-3.5 py-2 text-sm leading-relaxed"
      :class="
        isUser
          ? 'bg-primary text-primary-foreground rounded-br-sm'
          : 'bg-surface border border-border text-foreground rounded-bl-sm'
      "
    >
      <UiMarkdown v-if="!isUser" :source="message.content" />
      <span v-else class="whitespace-pre-wrap break-words">{{ message.content }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UiMarkdown } from '@/shared/components'
import { ChatRole } from '../../enums/chat-role.enum'
import type { AiChatMessage } from '../../interfaces/ai-syllabus.interface'

const props = defineProps<{ message: AiChatMessage }>()
const isUser = computed(() => props.message.role === ChatRole.USER)
</script>
