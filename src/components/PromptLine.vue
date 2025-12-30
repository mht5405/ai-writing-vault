<template>
  <div class="px-4 pt-2 pb-4 bg-transparent h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10" @click="clearSelection">
    <h3 class="font-sans text-xl font-bold mb-5 ml-1 text-[var(--text-normal)] select-none">{{ selectedDate }}</h3>
    
    <div class="pl-2">
      <div class="relative border-l-2 border-[var(--background-modifier-border)] ml-1.5 space-y-6 pb-2">
        <div 
          v-for="item in sortedPromptContent"
          :key="item.id_timestamp"
          class="relative pl-6"
        >
          <!-- Timeline Dot -->
          <div class="absolute -left-[7px] top-3 w-[12px] h-[12px] rounded-full bg-apple-blue border-2 border-[var(--background-primary)] shadow-[0_0_0_2px_rgba(0,122,255,0.2)]"></div>
          
          <!-- Timestamp -->
          <div class="font-sans text-xs text-[var(--text-muted)] mb-2 select-none">
            {{ formatTime(item.id_timestamp) }}
          </div>

          <!-- Card -->
          <div class="bg-[var(--background-primary)] rounded-lg p-3 cursor-pointer transition-all duration-200 border border-[var(--apple-border)] select-text hover:bg-[var(--apple-bg-secondary)] hover:translate-x-1 hover:shadow-sm hover:border-transparent" @click="clickItem(item.answer)">
            <div class="font-sans text-[13px] leading-relaxed text-[var(--text-normal)] line-clamp-3 overflow-hidden select-text">{{item.prompt}}</div>
          </div>
        </div>
      </div>
    </div>     
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {usePromptStore} from '../store/prompts'

const promptStore = usePromptStore()


const props = defineProps<{
    plugin: any
}>();

const selectedDate = computed(()=>{
  // console.log(promptStore.selectedDate)
  return promptStore.selectedDate
})

let selectedPromptStats = computed(()=>{
  const promptStats = promptStore.promptStats
  // console.log('promptLine:',promptStats[promptStore.selectedDate] )
  return promptStats[promptStore.selectedDate] 
})

const sortedPromptContent = computed(() => {

  if(!selectedPromptStats.value){
    // console.log('!!')
    return {}
  }
  // 创建副本避免修改原始数据
  const content = [...selectedPromptStats.value.prompt_content];
  
  // 按时间戳从新到旧排序（降序）
  return content.sort((a, b) => {
    // 确保时间戳为数字（如字符串需转换）
    const timeA = Number(a.id_timestamp);
    const timeB = Number(b.id_timestamp);
    return timeB - timeA; // 降序
  })
})

const formatTime = (timestamp: string) => {
  try {
    if (!isNaN(Number(timestamp))) {
      return new Date(Number(timestamp)).toLocaleTimeString();
    }
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return '无效时间';
    }
    return date.toLocaleTimeString();
  } catch (error) {
    // console.error('时间格式化错误:', error);
    return '无效时间';
  }
}

const clickItem = (answer: any)=>{
  promptStore.updateHistoryCard(answer)
}

// 添加清除选中文本的函数
const clearSelection = (event: MouseEvent) => {
  // 检查点击是否发生在文本内容之外
  const target = event.target as HTMLElement;
  if (!target.closest('.prompt-content')) {
    window.getSelection()?.removeAllRanges();
  }
}
</script>