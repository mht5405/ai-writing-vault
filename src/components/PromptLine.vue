<template>
  <div class="flex flex-col h-full bg-transparent overflow-hidden" @click="clearSelection">
    
    <!-- Header with Date and Search (Fixed) -->
    <div class="flex-none px-4 pt-2 pb-2">
      <div class="flex items-center justify-between h-8">
        <!-- Date Title -->
        <h3 v-if="!isSearchActive" class="font-sans text-xl font-bold text-[var(--text-normal)] select-none truncate ml-1">{{ selectedDate }}</h3>
        
        <!-- Search Input -->
        <div v-else 
          class="flex-1 flex items-center bg-[var(--background-modifier-form-field)] rounded-md px-2 py-1 mr-2 animate-in fade-in slide-in-from-right-2 duration-200 transition-all"
          :style="{
            border: isInputFocused ? '1px solid #007AFF' : '1px solid var(--background-modifier-border)',
            boxShadow: isInputFocused ? '0 0 0 1px #007AFF' : 'none'
          }"
        >
          <input 
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="w-full bg-transparent border-none p-0 text-sm text-[var(--text-normal)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-0"
            placeholder="Search prompts..."
            @keydown.esc="closeSearch"
            @blur="handleBlur"
            @focus="isInputFocused = true"
          />
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
    </div>
    
    <!-- Content (Scrollable) -->
    <div class="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10">
      <div class="pl-2">
        <!-- Timeline Container -->
        <div class="relative ml-2 space-y-6 pb-2">
          <div v-if="sortedPromptContent.length === 0" class="pl-6 text-sm text-[var(--text-muted)] italic">
            No prompts found.
          </div>
          <div 
            v-for="(item, index) in sortedPromptContent"
            :key="item.id_timestamp"
            class="relative pl-6 group"
          >
            <!-- Vertical Line (Connects to next item) -->
            <div v-if="index !== sortedPromptContent.length - 1" class="absolute left-0 top-3 h-[calc(100%+24px)] w-[2px] bg-[var(--background-modifier-border)]"></div>

            <!-- Timeline Dot -->
            <div class="absolute -left-[4.5px] top-3 w-[11px] h-[11px] rounded-full bg-[#007AFF] border-2 border-[#007AFF] group-hover:scale-125 group-hover:shadow-[0_0_0_3px_rgba(0,122,255,0.3)] transition-all duration-200 z-10"></div>
            
            <!-- Timestamp -->
            <div class="font-sans text-xs text-[var(--text-muted)] mb-2 select-none group-hover:text-[#007AFF] transition-colors duration-200">
              {{ formatTime(item.id_timestamp) }}
            </div>

            <!-- Card -->
            <div class="prompt-content bg-[var(--background-primary)] rounded-lg p-3 cursor-pointer transition-all duration-200 border border-[var(--background-modifier-border)] select-text group-hover:border-apple-blue group-hover:shadow-sm group-active:border-apple-blue group-active:shadow-md" @click="clickItem(item)">
              <div class="font-sans text-[13px] leading-relaxed text-[var(--text-normal)] line-clamp-3 overflow-hidden select-text">{{item.prompt}}</div>
            </div>
          </div>
        </div>
      </div>     
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import {usePromptStore} from '../store/prompts'

const isInputFocused = ref(false);
const promptStore = usePromptStore()


const props = defineProps<{
    plugin: any
}>();

const isSearchActive = ref(false);
const searchQuery = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);

// Automatically focus the search input when the component is mounted
onMounted(() => {
  if (searchInputRef.value) {
    searchInputRef.value.focus();
  }
});

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
  isInputFocused.value = false;
}

const handleBlur = () => {
  isInputFocused.value = false;
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