<script setup lang="ts">
import { computed} from 'vue';
import { usePromptStore } from '../store/prompts';
import { Notice, WorkspaceLeaf } from 'obsidian';

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
   <div class="w-full px-4 py-4">
      <div class="flex justify-between items-center bg-[var(--background-secondary)] rounded-lg p-3 border border-[var(--apple-border)] shadow-sm">
         <div class="flex flex-col items-center flex-1 border-r border-[var(--apple-border)] cursor-pointer hover:bg-[var(--apple-bg-secondary)] transition-colors rounded-l-md" @click="onTotalPromptsClick">
            <span class="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Prompts</span>
            <b class="text-xl font-semibold text-[var(--text-normal)]">{{ totalPrompts }}</b>
         </div>
         <div class="flex flex-col items-center flex-1 cursor-default">
            <span class="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Days</span>
            <b class="text-xl font-semibold text-[var(--text-normal)]">{{ aiDays }}</b>
         </div>
      </div>
   </div>
</template>