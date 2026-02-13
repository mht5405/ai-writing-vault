<script setup> 
import { onMounted } from 'vue'
import { usePromptStore } from '../store/prompts'
import wordcloud from 'wordcloud'
import { Segment, useDefault } from 'segmentit'

const promptStore = usePromptStore()

const buildWordList = () => {
    const stats = promptStore.promptStats;
    if (!stats) return [];

    const allPrompts: string[] = [];
    for (const date in stats) {
        const prompt_content = stats[date]?.prompt_content || [];
        const prompts = prompt_content.flatMap((item: any) => {
            if (Array.isArray(item.messages) && item.messages.length > 0) {
                return item.messages.map((msg: any) => msg.prompt);
            }
            return item.prompt ? [item.prompt] : [];
        });
        allPrompts.push(...prompts);
    }

    const segmentit = useDefault(new Segment());
    const wordFreq: Record<string, number> = {};
    allPrompts.forEach((prompt) => {
        const words = segmentit.doSegment(prompt, { simple: true });
        words.forEach((word: string) => {
            if (!word) return;
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
    });

    return Object.entries(wordFreq);
};

onMounted(() => {
    const list = buildWordList();
    if (!list.length) return;
    const canvas = document.getElementById('cloud_canvas');
    if (!canvas) return;
    wordcloud(canvas, { list });
})
</script>

<template>
    <canvas  id="cloud_canvas" class="word-cloud-component">
        
    </canvas>    
</template>

<style scoped>
.word-cloud-component{
    border: 1px solid var(--apple-border);
    border-radius: 12px;
    width: 100%;
    height: 120px;
    background: var(--background-primary);
}
</style>
