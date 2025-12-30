<script setup>
import * as d3 from 'd3'
import { ref, onMounted,nextTick, watchEffect, watch, reactive } from 'vue';
import { usePromptStore } from '../store/prompts'

const promptStore = usePromptStore()
const pixel_width = ref(12)
const svg_left_or_right_margin = ref(10)
const svg_top_bottom_margin = ref(10)
const pixel_margin = ref(5) // rect与右边的rect之间的间隔
var rect_count_x = ref(0)

const observer = new ResizeObserver(entries =>{
    for(let entry of entries){
        var newWidth = entry.contentRect.width
        const min_margin = 10
        const col_width = pixel_width.value + pixel_margin.value
        
        // Calculate max columns
        const count = Math.floor((newWidth - 2 * min_margin + pixel_margin.value) / col_width)
        rect_count_x.value = Math.max(1, count)
        
        // Calculate centered margin
        const used_width = rect_count_x.value * col_width - pixel_margin.value
        svg_left_or_right_margin.value = (newWidth - used_width) / 2
    }
})

// 监听变化
watch([rect_count_x, svg_left_or_right_margin],()=>{
    draw_svg() 
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
        if(promptStore.promptStats[date_str]){
            prompts_num = promptStore.promptStats[date_str].num
        } 
        date_list.unshift({"date": date_str, "prompts_num": prompts_num || 0}) // 新日期插入到数组前面
    }
    // console.log(date_list)

    
    d3.select('#svg_container').selectAll('rect').data(date_list)
     .enter().append('rect')
      .attr('width', pixel_width.value)
      .attr('height', pixel_width.value)
      .attr('rx', 3) // 圆角
      .attr('ry', 3)
      .attr('x',(d,i)=>{
        const col = Math.floor(i / 7) // 计算当前rect是第几列
        return svg_left_or_right_margin.value + (pixel_width.value + pixel_margin.value) * (col)    
      })
      .attr('y',(d,i)=>{
        const row = i % 7 // 计算当前rect是第几行
        return svg_top_bottom_margin.value + (pixel_width.value + pixel_margin.value) * (row)    
      })
      .attr('fill', v => {
        if (v.prompts_num == 0) {
            return 'var(--apple-bg-secondary)'  // 使用 CSS 变量适配深色模式
        }

        if (v.prompts_num > 14) {
            return 'var(--apple-blue)'  // 深蓝色
        }
        if(v.prompts_num >9){
            return 'rgba(0, 122, 255, 0.8)'
        }
        if(v.prompts_num >4){
            return 'rgba(0, 122, 255, 0.6)'
        }
        return 'rgba(0, 122, 255, 0.4)'  // 浅蓝色
        })
     .on('click', (e,v)=>handleClick(e,v))
     .style('cursor', 'pointer') // 添加鼠标手势
     .append('title') // 添加悬浮提示
      .text(d => `${d.date}: ${d.prompts_num} prompts`)
    
    // 计算并设置SVG的实际高度
    const svgHeight = svg_top_bottom_margin.value * 2 + (pixel_width.value + pixel_margin.value) * 7 - pixel_margin.value
    d3.select('#svg_container').attr('height', svgHeight)
}

const handleClick = (e,v)=>{
    // console.log(`Clicked on date: ${v.date}, prompts_num: ${v.prompts_num}`)
    // 点击某个日期的rect，触发事件，显示该日期的所有prompts
    promptStore.selectedDate = v.date
}

// 监听 promptStats 的变化
watch(() => promptStore.promptStats, async () => {
    await nextTick() // 等待DOM更新完成
    // console.log('promptStats changed, redrawing svg...')
    draw_svg()
}, { deep: true })

</script>

<template>
    <div id="container" class="w-full">
        <div class="bg-[var(--background-secondary)] overflow-hidden">
            <svg id="svg_container" class="w-full h-auto block"></svg>
        </div>
    </div> 
</template>