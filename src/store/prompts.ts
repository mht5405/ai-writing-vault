import {ref, computed} from 'vue'
import {defineStore} from 'pinia'
import {usePluginStore} from './plugin'


export const usePromptStore = defineStore('prompts',()=>{
    const pluginStore = usePluginStore()

    const promptStats = ref()
    const selectedDate = ref(new Date().toISOString().split('T')[0])
    const historyCard = ref<any>(null)
    const currentThreadId = ref<string | null>(null)
    const focusedMessageId = ref<string | null>(null)

    // 初始化时从插件设置里加载数据
    if (pluginStore.plugin) {
        promptStats.value = { ...pluginStore.plugin.settings.promptStats };
    }
   
    async function addPrompt(prompt: string, answer:string, reasoning?: string){
        if(!pluginStore.plugin) return;
            // 获取当前日期作为键
        const today = new Date().toISOString().split('T')[0];

        // 深拷贝当前状态避免直接修改
        const newStats = { ...promptStats.value };
        
        if (!newStats[today]) {
            newStats[today] = { num: 0, prompt_content: [] };
        }
        
        const messageId = Date.now().toString();
        const message = { id_timestamp: messageId, prompt, answer, reasoning };
        let thread = null;

        if (currentThreadId.value) {
            thread = newStats[today].prompt_content.find((item: any) => item.id_timestamp === currentThreadId.value);
        }

        if (!thread) {
            thread = {
                id_timestamp: messageId,
                prompt,
                answer,
                messages: [message]
            };
            newStats[today].prompt_content.push(thread);
            currentThreadId.value = messageId;
        } else {
            const existingMessages = Array.isArray(thread.messages) ? thread.messages : [{
                id_timestamp: thread.id_timestamp,
                prompt: thread.prompt,
                answer: thread.answer,
                reasoning: thread.reasoning
            }];
            thread.messages = [...existingMessages, message];
        }

        // 更新计数（按消息计数）
        newStats[today].num += 1;

        // 更新响应式数据
        promptStats.value = newStats;
        historyCard.value = thread;
        
        // 同步到插件设置
        pluginStore.plugin.settings.promptStats = newStats;
        await pluginStore.plugin.saveSettings();
    }

    function updateHistoryCard(item: any){
        historyCard.value = item
        currentThreadId.value = item?.id_timestamp ?? null
        // console.log('item被点击')
    }

    function focusMessage(messageId: string){
        if (focusedMessageId.value === messageId) {
            focusedMessageId.value = null;
            window.setTimeout(() => {
                focusedMessageId.value = messageId;
            }, 0);
            return;
        }
        focusedMessageId.value = messageId
    }

    function clearFocus(){
        focusedMessageId.value = null
    }

    function findAndSelectPromptById(id: string) {
        if (!promptStats.value) return;
        
        for (const date in promptStats.value) {
            const dayStats = promptStats.value[date];
            if (dayStats && dayStats.prompt_content) {
                const found = dayStats.prompt_content.find((p: any) => p.id_timestamp === id);
                if (found) {
                    updateHistoryCard(found);
                    return found;
                }
            }
        }
        return null;
    }

    function startNewThread(){
        currentThreadId.value = null;
        historyCard.value = null;
    }

    async function deleteThread(threadId: string){
        if (!pluginStore.plugin || !promptStats.value) return;
        const newStats = { ...promptStats.value };
        let deleted = false;

        for (const date in newStats) {
            const dayStats = newStats[date];
            if (!dayStats || !dayStats.prompt_content) continue;
            const index = dayStats.prompt_content.findIndex((item: any) => item.id_timestamp === threadId);
            if (index !== -1) {
                const thread = dayStats.prompt_content[index];
                const count = Array.isArray(thread.messages) ? thread.messages.length : 1;
                dayStats.prompt_content.splice(index, 1);
                dayStats.num = Math.max(0, (dayStats.num || 0) - count);
                if (dayStats.prompt_content.length === 0) {
                    delete newStats[date];
                }
                deleted = true;
                break;
            }
        }

        if (!deleted) return;

        promptStats.value = newStats;
        if (historyCard.value?.id_timestamp === threadId) {
            historyCard.value = null;
        }
        if (currentThreadId.value === threadId) {
            currentThreadId.value = null;
        }

        pluginStore.plugin.settings.promptStats = newStats;
        await pluginStore.plugin.saveSettings();
    }

    function getCurrentThread(){
        if (!currentThreadId.value || !promptStats.value) return null;
        for (const date in promptStats.value) {
            const dayStats = promptStats.value[date];
            if (dayStats && dayStats.prompt_content) {
                const found = dayStats.prompt_content.find((p: any) => p.id_timestamp === currentThreadId.value);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    return {promptStats, addPrompt, selectedDate, updateHistoryCard, historyCard, findAndSelectPromptById, startNewThread, currentThreadId, getCurrentThread, deleteThread, focusedMessageId, focusMessage, clearFocus}
})
