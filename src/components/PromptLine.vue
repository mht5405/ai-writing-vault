<template>
  <div class="px-4 pt-2 pb-4 bg-transparent h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10" @click="clearSelection">
    
    <!-- Header with Date and Search -->
    <div class="flex items-center justify-between mb-5 ml-1 h-8">
      <!-- Date Title -->
      <h3 v-if="!isSearchActive" class="font-sans text-xl font-bold text-[var(--text-normal)] select-none truncate">{{ selectedDate }}</h3>
      
      <!-- Search Input -->
      <div v-else class="flex-1 flex items-center bg-[var(--background-modifier-form-field)] rounded-md border border-[var(--background-modifier-border)] px-2 py-1 mr-2 animate-in fade-in slide-in-from-right-2 duration-200 focus-within:border-[var(--interactive-accent)] focus-within:ring-1 focus-within:ring-[var(--interactive-accent)] transition-all">
        <input 
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          class="w-full bg-transparent border-none p-0 text-sm text-[var(--text-normal)] placeholder-[var(--text-muted)] focus:outline-none"
          placeholder="Search prompts..."
          @keydown.esc="closeSearch"
          @blur="handleBlur"
        />
        <button 
          v-if="searchQuery" 
          @click="searchQuery = ''" 
          class="ml-1 p-0.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-normal)] hover:bg-[var(--background-modifier-hover)] transition-colors flex-shrink-0"
          title="Clear search"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Search Toggle Button -->
      <button 
        @click="toggleSearch"
        class="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-normal)] hover:bg-[var(--background-modifier-hover)] transition-colors"
        :class="{'bg-[var(--background-modifier-hover)] text-[var(--text-normal)]': isSearchActive}"
        title="Search"
      >
        <svg v-if="!isSearchActive" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <div class="pl-2">
      <div class="relative border-l-2 border-[var(--background-modifier-border)] ml-1.5 space-y-6 pb-2">
        <div v-if="sortedPromptContent.length === 0" class="pl-6 text-sm text-[var(--text-muted)] italic">
          No prompts found.
        </div>
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
          <div class="prompt-content bg-[var(--background-primary)] rounded-lg p-3 cursor-pointer transition-all duration-200 border border-[var(--apple-border)] select-text hover:bg-[var(--apple-bg-secondary)] hover:translate-x-1 hover:shadow-sm hover:border-transparent" @click="clickItem(item)">
            <div class="font-sans text-[13px] leading-relaxed text-[var(--text-normal)] line-clamp-3 overflow-hidden select-text">{{item.prompt}}</div>
          </div>
        </div>
      </div>
    </div>     
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import {usePromptStore} from '../store/prompts'

const promptStore = usePromptStore()


const props = defineProps<{
    plugin: any
}>();

const isSearchActive = ref(false);
const searchQuery = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);

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
  let content: any[] = [];

  // 1. 如果有搜索词，进行全局搜索
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    const allStats = promptStore.promptStats;
    
    if (allStats) {
      // 遍历所有日期
      Object.keys(allStats).forEach(date => {
        const dayStats = allStats[date];
        if (dayStats && dayStats.prompt_content) {
          // 筛选符合条件的条目
          const matches = dayStats.prompt_content.filter((item: any) => {
            return item.prompt && item.prompt.toLowerCase().includes(query);
          });
          content.push(...matches);
        }
      });
    }
  } 
  // 2. 如果没有搜索词，只显示当前选中日期的内容
  else {
    if (selectedPromptStats.value && selectedPromptStats.value.prompt_content) {
      content = [...selectedPromptStats.value.prompt_content];
    }
  }

  // 3. 统一按时间戳倒序排序
  return content.sort((a, b) => {
    // 确保时间戳为数字（如字符串需转换）
    const timeA = Number(a.id_timestamp);
    const timeB = Number(b.id_timestamp);
    return timeB - timeA; // 降序
  })
})

const toggleSearch = () => {
  if (isSearchActive.value) {
    closeSearch();
  } else {
    isSearchActive.value = true;
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
}

const closeSearch = () => {
  isSearchActive.value = false;
  searchQuery.value = '';
}

const handleBlur = () => {
  // 如果没有输入内容，失去焦点时自动关闭
  if (!searchQuery.value) {
    isSearchActive.value = false;
  }
}

const formatTime = (timestamp: string) => {
  try {
    const date = !isNaN(Number(timestamp)) ? new Date(Number(timestamp)) : new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      return '无效时间';
    }

    // 如果处于搜索模式，显示完整日期和时间
    if (searchQuery.value.trim()) {
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // 默认模式只显示时间
    return date.toLocaleTimeString();
  } catch (error) {
    // console.error('时间格式化错误:', error);
    return '无效时间';
  }
}

const clickItem = (item: any)=>{
  promptStore.updateHistoryCard(item)
}

// 添加清除选中文本的函数
const clearSelection = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  
  // 如果点击的是输入框或按钮，不执行清除操作，避免导致输入框失焦
  if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.closest('input') || target.closest('button')) {
    return;
  }

  // 检查点击是否发生在文本内容之外
  if (!target.closest('.prompt-content')) {
    window.getSelection()?.removeAllRanges();
  }
}
</script>