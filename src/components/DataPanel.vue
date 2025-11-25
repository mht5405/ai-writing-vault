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
   <div class="data-panel">
      <div class="data-item">
         <b class="data-value" @click="onTotalPromptsClick">{{ totalPrompts }}</b>
         <span class="data-label">Prompts</span>
      </div>
      <div class="data-item">
         <b class="data-value">{{ aiDays }}</b>
         <span class="data-label">Days</span>
      </div>
   </div>
</template>

<style scoped>
.data-panel {
   height: 50px;
   display: flex;
   justify-content: center;   
   align-items: center;
   padding: 2rem 0;
   /* background: #f8f9fa; */
   /* border-radius: 10px; */
   /* box-shadow: 0 2px 8px rgba(0,0,0,0.04); */
}

.data-item {
   display: flex;
   flex-direction: column;
   align-items: center;
   min-width: 80px;
}

.data-value {
   font-size: 1.2rem;
   font-weight: bold;
   color: #3b82f6;
   margin-bottom: 0.2rem;
   transition: color 0.2s, cursor 0.2s;
   cursor: pointer;
}
.data-value:hover {
   color: #2563eb;
   text-shadow: 0 2px 8px rgba(59,130,246,0.08);
}

.data-label {
   font-size: 0.8rem;
   color: #6b7280;
   letter-spacing: 0.05em;
}
</style>