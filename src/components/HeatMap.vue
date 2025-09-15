<script setup>
import * as d3 from 'd3'
import { ref, onMounted,nextTick, watchEffect, watch } from 'vue';
import { usePromptStore } from '../store/prompts'

const promptStore = usePromptStore()
const pixel_width = ref(12)
const svg_left_or_right_margin = ref(10)
const pixel_margin = ref(5) // rect与右边的rect之间的间隔
var rect_count_x = ref(0)
const promptStats = promptStore.promptStats

const observer = new ResizeObserver(entries =>{
    for(let entry of entries){
        var newWidth = entry.contentRect.width
        // console.log(`新宽度：${newWidth}px`)
        // 随着svg宽度的拖拽，计算新宽度里，一行可以放多少个rect
        rect_count_x.value = Math.floor((newWidth - svg_left_or_right_margin.value * 2 - pixel_margin.value) / (pixel_width.value + pixel_margin.value))
        // console.log(`${rect_count_x}`)
    }
})

// 监听rect_count_x的变化
watch(rect_count_x,(newValue, oldValue)=>{
    // console.log(`一行里面的rect的个数是${newValue}`)
    
    draw_svg() // 根据这个rect_count_x，重新绘制svg
})

onMounted(async ()=>{
    // console.log('这里是onMounted钩子')
    await nextTick() // 等待DOM更新完成
    observer.observe(document.getElementById('svg_container'))
    draw_svg();
})

const draw_svg = async ()=>{
    await nextTick() // 等待DOM更新完成
    d3.select('#svg_container').selectAll('rect').remove()
    // 日期方块的个数应该是： rect_count_x * 7
    // svg中的日期方块的渲染布局应该是先纵向布局，再横向布局。纵向布局7个日期方块，再横向布局
    // 要从jsonData中读取对应个数的日期方, 从当前日期往前推 rect_count_x * 7 个日期方块
    // 把计算出来的日期方块与svg中的rect进行绑定
    const rect_count = rect_count_x.value * 7
    // 从今天倒推 rect_count 天，放在一个列表中
    const today = new Date()
    var date_list = []
    for(let i=0; i<rect_count; i++){
        const date = new Date()
        date.setDate(today.getDate() - i)
        const date_str = date.toISOString().split('T')[0] // 只取日期部分
        // 查找 promptStats 中是否有这个日期的键
        let prompts_num = 0
        if(promptStats[date_str]){
            prompts_num = promptStats[date_str].num
        } 
        date_list.unshift({"date": date_str, "prompts_num": prompts_num || 0}) // 新日期插入到数组前面
    }
    // console.log(date_list)

    
    d3.select('#svg_container').selectAll('rect').data(date_list)
     .enter().append('rect')
      .attr('width', pixel_width.value)
      .attr('height', pixel_width.value)
      .attr('fill','#4A90E2')
      .attr('x',(d,i)=>{
        const col = Math.floor(i / 7) // 计算当前rect是第几列
        return svg_left_or_right_margin.value + (pixel_width.value + pixel_margin.value) * (col)    
      })
      .attr('y',(d,i)=>{
        const row = i % 7 // 计算当前rect是第几行
        return svg_left_or_right_margin.value + (pixel_width.value + pixel_margin.value) * (row)    
      })
      .attr('fill', v => {
        if (v.prompts_num == 0) {
            return '#EFEFEF'  // 表示无数据
        }

        if (v.prompts_num > 14) {
            return '#2C82C9'  // 深蓝色，表示多条数据
        }
        if(v.prompts_num >9){
            return '#4A90E2'
        }
        if(v.prompts_num >4){
            return '#7CB9E8'
        }
        return '#A7C7E7'  // 浅蓝色，表示一条数据
        })
     .on('click', (e,v)=>handleClick(e,v))
     .append('title') // 添加悬浮提示
      .text(d => `${d.date}: ${d.prompts_num} prompts`)
    
}

const handleClick = (e,v)=>{
    // console.log(`Clicked on date: ${v.date}, prompts_num: ${v.prompts_num}`)
    // 点击某个日期的rect，触发事件，显示该日期的所有prompts
    promptStore.selectedDate = v.date
}

// 监听 promptStats 的变化
watch(() => promptStore.promptStats, async () => {
    // console.log('promptStats changed, redrawing svg...')
    await draw_svg()
}, { deep: true })

</script>

<template>
    <div id="container">
        <svg id="svg_container"></svg>
    </div> 
</template>

<style scoped>
svg{
    width:100%;
    margin:10px;
}

</style>