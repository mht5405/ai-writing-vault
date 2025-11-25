<script setup>
import { computed } from 'vue';
import { usePromptStore } from '../store/prompts';

const promptStore = usePromptStore();

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
</script>

<template>
   <div class="data-panel">
      <div class="data-item">
         <b class="data-value">{{ totalPrompts }}</b>
         <span class="data-label">Prompts</span>
      </div>
      <div class="data-item">
         <b class="data-value">{{ aiDays }}</b>
         <span class="data-label">天</span>
      </div>
   </div>
</template>

<style scoped>
.data-panel {
   height: 50px;
   display: flex;
   justify-content: center;
   align-items: center;
   gap: 2rem; 
   padding: 2rem 0;
   background: #f8f9fa;
   border-radius: 10px;
   box-shadow: 0 2px 8px rgba(0,0,0,0.04);
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
}

.data-label {
   font-size: 0.8rem;
   color: #6b7280;
   letter-spacing: 0.05em;
}
</style>