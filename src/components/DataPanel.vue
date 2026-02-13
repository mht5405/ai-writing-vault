<script setup lang="ts">
import { computed } from 'vue';
import { usePromptStore } from '../store/prompts';
import { Notice } from 'obsidian';

const promptStore = usePromptStore();

const props = defineProps<{
    plugin: any
}>();

// 统计总prompts数量
const totalPrompts = computed(() => {
   if (!promptStore.promptStats) return 0;
   let total = 0;
   const stats = promptStore.promptStats;
   if (!stats || typeof stats !== 'object') return 0;
   for (const day in stats) {
      if (stats[day]?.prompt_content) {
         total += stats[day].prompt_content.length;
      }
   }
   return total;
});

// 统计有AI处理的天数
const aiDays = computed(() => {
   if (!promptStore.promptStats) return 0;
   const stats = promptStore.promptStats;
   if (!stats || typeof stats !== 'object') return 0;
   return Object.keys(stats).length;
});

const onTotalPromptsClick = async () => {
   // 这里可以自定义点击后的行为
   new Notice(`Total Prompts: ${totalPrompts.value}`);
   
};

</script>

<template>
   <div class="w-full px-4 pt-4 pb-3">
      <div class="ai-panel p-3 flex items-center justify-between gap-3">
         <div class="flex flex-col flex-1 cursor-pointer rounded-xl px-2 py-1 hover:bg-[var(--apple-bg-secondary)] transition-colors" @click="onTotalPromptsClick">
            <span class="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Prompts</span>
            <b class="text-2xl font-semibold text-[var(--text-normal)]">{{ totalPrompts }}</b>
         </div>
         <div class="h-8 w-px bg-[var(--background-modifier-border)]"></div>
         <div class="flex flex-col flex-1 rounded-xl px-2 py-1">
            <span class="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Days</span>
            <b class="text-2xl font-semibold text-[var(--text-normal)]">{{ aiDays }}</b>
         </div>
      </div>
   </div>
</template>
