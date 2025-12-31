<template>
    <div class="flex flex-col items-center justify-center h-full space-y-6">
        <div class="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--background-primary)] border border-[var(--apple-border)] shadow-sm">
            <div class="flex gap-1.5">
                <div class="w-2 h-2 bg-apple-blue rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div class="w-2 h-2 bg-apple-blue rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div class="w-2 h-2 bg-apple-blue rounded-full animate-bounce"></div>
            </div>
            <span class="text-sm font-medium text-[var(--text-muted)]">AI is thinking...</span>
        </div>
        
        <div class="w-full max-w-lg space-y-4 px-6">
            <div class="h-3 bg-[var(--text-muted)] opacity-10 rounded-full w-3/4 animate-pulse"></div>
            <div class="h-3 bg-[var(--text-muted)] opacity-10 rounded-full w-full animate-pulse"></div>
            <div class="h-3 bg-[var(--text-muted)] opacity-10 rounded-full w-5/6 animate-pulse"></div>
            <div class="h-3 bg-[var(--text-muted)] opacity-10 rounded-full w-2/3 animate-pulse"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
</style>
