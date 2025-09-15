<script setup> 
import { onMounted, ref } from 'vue'
import { usePromptStore } from '../store/prompts'
import wordcloud from 'wordcloud'
import { Segment, useDefault } from 'segmentit'

const promptStore = usePromptStore()
const promptStats = ref(promptStore.promptStats)

// 遍历promptStats，提取所有的prompt，放在一个数组中
let all_prompts = []
for(let date in promptStats.value){
    const prompt_content = promptStats.value[date].prompt_content;
    // prompt_content是一个列表，里面的各个项是一个对象，提取这个对象里的prompt字段
    const prompts = prompt_content.map(item => item.prompt)
    all_prompts = all_prompts.concat(prompts)
}
// console.log(all_prompts)

// 使用segmentit对all_promots进行分词，统计词频
let word_freq = {}
const segmentit = useDefault(new Segment())
all_prompts.forEach(prompt => {
    console.log(prompt)
    // 每一个prompt进行分词
    const words = segmentit.doSegment(prompt, { simple: true })
    // console.log(words)
    // words.forEach(word => {
    //     if(word_freq[word]){
    //         word_freq[word] += 1
    //     } else {
    //         word_freq[word] = 1
    //     }
    // })
    // 所以不应该用分词，应该进行关键词提取，再根据关键词的词频，绘制词云
    
})
console.log(word_freq)

// 将 word_freq 转换为数组格式，方便wordcloud使用
const word_freq_list = Object.entries(word_freq)
console.log(word_freq_list)

onMounted(()=>{
    wordcloud(document.getElementById('cloud_canvas'), { 
        list: word_freq_list,
        
    } );
})
</script>

<template>
    <canvas  id="cloud_canvas" class="word-cloud-component">
        
    </canvas>    
</template>

<style scoped>
.word-cloud-component{
    border:1px solid #ccc;
    width:100%;
    height:100px;
}
</style>