<template>
  <div class="flex flex-col h-full bg-transparent overflow-hidden" @click="clearSelection">
    
    <!-- Header with Date and Search (Fixed) -->
    <div class="flex-none px-4 pt-3 pb-2">
      <div class="flex items-center justify-between h-8">
        <!-- Date Title -->
        <h3 v-if="!isSearchActive" class="font-sans text-[15px] font-semibold text-[var(--text-normal)] select-none truncate ml-1 tracking-wide">{{ selectedDate }}</h3>
        
        <!-- Search Input -->
        <div v-else 
          class="flex-1 flex items-center bg-[var(--background-primary)] rounded-lg px-2 py-1 mr-2 border border-[var(--apple-border)] shadow-[var(--apple-shadow-sm)] transition-all"
          :style="{
            border: isInputFocused ? '1px solid var(--apple-blue)' : '1px solid var(--background-modifier-border)',
            boxShadow: isInputFocused ? '0 0 0 1px var(--apple-blue)' : 'none'
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
          class="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-normal)] hover:bg-[var(--apple-bg-secondary)] transition-colors"
          :class="{'bg-[var(--apple-bg-secondary)] text-[var(--text-normal)]': isSearchActive}"
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
    <div class="flex-1 overflow-y-auto px-4 pb-4">
      <div class="pl-2">
        <!-- Timeline Container -->
        <div class="relative ml-2 space-y-5 pb-2">
          <div v-if="sortedPromptContent.length === 0" class="pl-6 text-sm text-[var(--text-muted)] italic">
            No prompts found.
          </div>
          <div 
            v-for="(item, index) in sortedPromptContent"
            :key="item.id_timestamp"
            class="relative pl-6 group"
          >
            <!-- Vertical Line (Connects to next item) -->
            <div v-if="index !== sortedPromptContent.length - 1" class="absolute left-0 top-3 h-[calc(100%+24px)] w-px bg-[var(--background-modifier-border)]"></div>

            <!-- Timeline Dot -->
            <div class="absolute -left-[4px] top-3 w-[9px] h-[9px] rounded-full bg-apple-blue/40 border border-apple-blue/60 group-hover:scale-110 group-hover:shadow-[0_0_0_3px_rgba(79,70,229,0.18)] transition-all duration-200 z-10"></div>
            
            <!-- Timestamp -->
            <div class="flex justify-between items-center mb-2">
              <div class="font-sans text-[11px] text-[var(--text-muted)] select-none group-hover:text-apple-blue transition-colors duration-200">
                {{ formatTime(item.id_timestamp) }}
              </div>
              
              <!-- Copy Link Button (Visible on Hover) -->
              <div class="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                <button 
                  @click.stop="copyLink(item)"
                  class="p-1 rounded hover:bg-[var(--background-modifier-hover)] text-[var(--text-muted)] hover:text-[var(--text-normal)] transition-all duration-200"
                  title="Copy Link to Note"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </button>
                <button
                  @click.stop="deleteItem(item)"
                  class="p-1 rounded hover:bg-[var(--background-modifier-hover)] text-[var(--text-muted)] hover:text-red-500 transition-all duration-200"
                  title="Delete"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                    <path d="M10 11v6"></path>
                    <path d="M14 11v6"></path>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Card -->
            <div class="prompt-content ai-panel-muted p-3 cursor-pointer transition-all duration-300 select-text group-hover:border-apple-blue group-hover:shadow-[var(--apple-shadow-sm)] relative" @click="clickItem(item)">
              <div class="font-sans text-[13px] leading-relaxed text-[var(--text-normal)] line-clamp-3 group-hover:line-clamp-none overflow-hidden select-text transition-all duration-300">{{item.prompt}}</div>
              <div v-if="item.messages && item.messages.length > 1" class="mt-2 space-y-1">
                <div
                  v-for="(msg, idx) in item.messages.slice(1)"
                  :key="msg.id_timestamp"
                  class="text-[12px] text-[var(--text-muted)] leading-relaxed truncate cursor-pointer hover:text-apple-blue transition-colors"
                  @click.stop="clickMessage(item, msg)"
                >
                  ↳ {{ msg.prompt }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>     
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue';
import { Notice } from 'obsidian';
import {usePromptStore} from '../store/prompts'

const isInputFocused = ref(false);
const promptStore = usePromptStore()


const isSearchActive = ref(false);
const searchQuery = ref('');
const debouncedSearchQuery = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);
let searchTimer: number | null = null;

// Automatically focus the search input when the component is mounted
onMounted(() => {
  if (searchInputRef.value) {
    searchInputRef.value.focus();
  }
});

const selectedDate = computed(()=>{
  if (!promptStore.selectedDate) return '';
  const date = new Date(promptStore.selectedDate);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
})

let selectedPromptStats = computed(()=>{
  const promptStats = promptStore.promptStats
  // console.log('promptLine:',promptStats[promptStore.selectedDate] )
  return promptStats[promptStore.selectedDate] 
})

const sortedPromptContent = computed(() => {
  let content: any[] = [];
  const query = debouncedSearchQuery.value.trim().toLowerCase();

  // 1. 如果有搜索词，进行全局搜索
  if (query) {
    const allStats = promptStore.promptStats;
    
    if (allStats) {
      // 遍历所有日期
      Object.keys(allStats).forEach(date => {
        const dayStats = allStats[date];
        if (dayStats && dayStats.prompt_content) {
          // 筛选符合条件的条目
          const matches = dayStats.prompt_content.filter((item: any) => {
            if (item.prompt && item.prompt.toLowerCase().includes(query)) {
              return true;
            }
            const messages = Array.isArray(item.messages) ? item.messages : [];
            return messages.some((msg: any) => msg.prompt && msg.prompt.toLowerCase().includes(query));
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
  debouncedSearchQuery.value = '';
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
    if (debouncedSearchQuery.value.trim()) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${year}/${month}/${day} ${time}`;
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
  promptStore.clearFocus?.();
}

const clickMessage = (item: any, msg: any) => {
  promptStore.updateHistoryCard(item);
  if (msg?.id_timestamp) {
    promptStore.focusMessage?.(msg.id_timestamp);
  }
}

const copyLink = (item: any) => {
    let linkText = 'AI Chat';
    if (item && item.prompt) {
        // 获取 prompt，移除换行符，截取前 30 个字符
        const promptText = item.prompt.replace(/[\r\n]+/g, ' ').trim();
        linkText = promptText.length > 30 ? promptText.substring(0, 30) + '...' : promptText;
        // 防止 [] 破坏 markdown 链接语法
        linkText = linkText.replace(/[\[\]]/g, ''); 
    }
    const link = `[${linkText}](obsidian://ai-writing-vault?id=${item.id_timestamp} "Open plugin:ai-writing-vault")`;
    navigator.clipboard.writeText(link);
    new Notice('Chat link copied to clipboard!');
}

const deleteItem = async (item: any) => {
    if (!item?.id_timestamp) return;
    const ok = window.confirm('确定要删除这条记录吗？删除后无法恢复。');
    if (!ok) return;
    await promptStore.deleteThread?.(item.id_timestamp);
    new Notice('记录已删除');
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

watch(searchQuery, (value) => {
  if (searchTimer) {
    window.clearTimeout(searchTimer);
  }
  searchTimer = window.setTimeout(() => {
    debouncedSearchQuery.value = value;
  }, 200);
});
</script>
