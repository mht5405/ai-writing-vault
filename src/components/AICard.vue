<template>
    <div class="flex flex-col h-full p-4 max-w-[980px] mx-auto w-full gap-4">
        <!-- Answer Area -->
        <div class="flex-1 min-h-0 ai-card relative overflow-hidden">
            <div v-if="!historyAnswer && !isLoading && !hasResponse" class="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-muted)] opacity-70 pointer-events-none">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="mb-3">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span class="text-[13px] font-medium">开始记录你的思考</span>
            </div>
            <div v-if="isThinking" class="absolute inset-0 z-10">
                <ThinkingClue />
            </div>
            <div ref="answerContainerRef" class="answer-field absolute inset-0 overflow-y-auto p-8 font-sans leading-relaxed select-text cursor-text prose dark:prose-invert max-w-none"></div>
        </div>

        <!-- Input Area -->
        <div class="flex-none ai-panel-muted p-4">
            <div class="flex flex-col gap-3">
                <div
                    class="relative w-full rounded-2xl border border-[var(--apple-border)] bg-[var(--background-primary)] transition-shadow focus-within:ring-2 focus-within:ring-apple-blue/20 focus-within:border-apple-blue shadow-[var(--apple-shadow-sm)] flex flex-col"
                    :style="{ height: inputPanelHeight + 'px' }"
                >
                    <div
                        class="absolute -top-2 left-1/2 -translate-x-1/2 h-5 w-20 flex items-center justify-center cursor-row-resize"
                        @mousedown.prevent="startResize"
                        title="拖动调整输入框高度"
                    >
                        <div class="h-1.5 w-12 rounded-full bg-[var(--background-modifier-border)]"></div>
                    </div>
                    <textarea
                        ref="textareaRef"
                        class="w-full flex-1 p-4 border-none rounded-2xl resize-none text-[15px] leading-relaxed bg-transparent text-[var(--text-normal)] overflow-y-auto font-sans outline-none placeholder:text-[var(--text-muted)]"
                        v-model="inputContent"
                        placeholder="写下你的问题或想法…"
                        @keydown="handleKeydown"
                    ></textarea>

                    <!-- Controls Bar -->
                    <div class="flex items-center gap-2 px-3 pb-3 pt-2 border-t border-[var(--background-modifier-border)]">
                        <div class="relative group w-[170px] shrink-0">
                            <div class="ai-btn ai-btn-ghost h-8 px-2 w-full">
                                <input
                                    v-model="modelQuery"
                                    class="ai-input truncate text-[12px] border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent bg-transparent"
                                    placeholder="Model"
                                    :title="modelQuery"
                                    @focus="openModelList"
                                    @blur="scheduleCloseModelList"
                                />
                            </div>
                            <div
                                v-if="isModelListOpen"
                                class="absolute left-0 bottom-full mb-1 w-full max-h-56 overflow-y-auto rounded-md border border-[var(--background-modifier-border)] bg-[var(--background-primary)] shadow-md z-50"
                            >
                                <div v-if="filteredModelOptions.length === 0" class="px-2 py-1 text-[12px] text-[var(--text-muted)]">
                                    无可用模型（可手动输入）
                                </div>
                                <div
                                    v-for="model in filteredModelOptions"
                                    :key="model"
                                    class="px-2 py-1 text-[12px] text-[var(--text-normal)] hover:bg-[var(--background-modifier-hover)] cursor-pointer truncate"
                                    @mousedown.prevent="selectModel(model)"
                                >
                                    {{ model }}
                                </div>
                                <div v-if="filteredModelOptions.length === modelListLimit" class="px-2 py-1 text-[11px] text-[var(--text-muted)]">
                                    仅显示前 {{ modelListLimit }} 个结果
                                </div>
                            </div>
                        </div>

                        <button
                            class="ai-btn ai-btn-ghost"
                            :class="thinkingEnabled ? 'bg-[rgba(79,70,229,0.14)] border border-[rgba(79,70,229,0.35)] text-apple-blue' : ''"
                            @click="toggleThinking"
                            title="Thinking mode"
                        >
                            思考
                        </button>
                        <button
                            class="ai-btn ai-btn-ghost"
                            @click="startNewChat"
                            title="New chat"
                        >
                            New
                        </button>

                        <div class="flex items-center gap-2 ml-auto">
                            <button
                                class="ai-pill"
                                @click="toggleContext"
                                :disabled="isContextLoading"
                                title="Attach current note as context"
                            >
                                <span v-if="!contextEnabled">📎 Note</span>
                                <span v-else>📄 Note</span>
                            </button>
                            <span
                                v-if="contextEnabled && contextLabel"
                                class="ai-pill ai-pill-accent truncate max-w-[160px]"
                                :title="contextLabel"
                            >
                                {{ contextLabel }}
                                <button
                                    class="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-apple-blue/15 text-apple-blue hover:bg-apple-blue/25"
                                    @click.stop="removeContext"
                                    title="Remove context"
                                >
                                    ×
                                </button>
                            </span>
                            <span v-if="isContextLoading" class="text-[11px] text-[var(--text-muted)]">读取中…</span>

                            <button
                                class="ai-btn ai-btn-primary h-8 px-4 rounded-full disabled:bg-[var(--background-modifier-border)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed"
                                @click="submit"
                                :disabled="isLoading || !inputContent.trim()"
                            >
                                <span v-if="!isLoading" class="flex items-center gap-1">
                                    发送
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                </span>
                                <span v-else class="flex items-center gap-2">
                                    <svg class="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    处理中
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed , watch, nextTick, onMounted, onUnmounted } from 'vue';
import { OpenAI } from 'openai';
import {MarkdownRenderer, Notice} from 'obsidian';
import type { EventRef, TFile } from 'obsidian';
import {usePromptStore} from '../store/prompts'
import ThinkingClue from './ThinkingClue.vue'
import hljs from 'highlight.js';

const props = defineProps<{
    plugin: any
}>();

const inputContent = ref('');
const isLoading = ref(false);
const isThinking = ref(false);
const hasResponse = ref(false);
const isLoadingModels = ref(false);
const thinkingEnabled = ref(false);
const promptStore = usePromptStore()
const modelOptions = ref<string[]>([]);
const chatModel = ref('');
const modelQuery = ref('');
const modelFilterQuery = ref('');
const isModelListOpen = ref(false);
const modelListLimit = 50;
let modelFilterTimer: number | null = null;
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const answerContainerRef = ref<HTMLElement | null>(null);
let renderSequence = 0;
let mathJaxPromise: Promise<void> | null = null;
let lastApiKey = '';
let lastApiUrl = '';
const contextEnabled = ref(false);
const contextLabel = ref('');
const contextContent = ref('');
const contextFilePath = ref('');
const isContextLoading = ref(false);
let activeLeafRef: EventRef | null = null;
let modifyFileRef: EventRef | null = null;
let lastMarkdownFile: TFile | null = null;
const inputPanelHeight = ref(180);
const isResizingInput = ref(false);
let resizeStartY = 0;
let resizeStartHeight = 0;

const historyItem = computed(() => promptStore.historyCard)
const historyAnswer = computed(()=>{
    if (!historyItem.value) return '';
    const messages = Array.isArray(historyItem.value?.messages) ? historyItem.value.messages : null;
    if (!messages || messages.length === 0) {
        return formatForDisplay(historyItem.value?.answer || '');
    }
    return buildThreadMarkdown(messages);
})

const getMarkdownView = () => {
    return props.plugin.app.workspace.getLeavesOfType("ai-writing-vault-itemview")[0]?.view;
};

const getActiveNoteFile = (): TFile | null => {
    const active = props.plugin.app.workspace.getActiveFile?.() ?? null;
    return active || lastMarkdownFile;
};

const loadCurrentNoteContext = async (showNotice = false) => {
    if (isContextLoading.value) return false;
    const file = getActiveNoteFile();
    if (!file) {
        if (showNotice) new Notice('未找到当前笔记。');
        return false;
    }
    if (file.extension !== 'md') {
        if (showNotice) new Notice('当前文件不是 Markdown 笔记，无法作为上下文。');
        return false;
    }
    isContextLoading.value = true;
    try {
        const content = await props.plugin.app.vault.read(file);
        contextContent.value = content || '';
        contextLabel.value = file.name;
        contextFilePath.value = file.path;
        if (showNotice) new Notice(`已加载当前笔记：${file.name}`);
        return true;
    } catch (error: any) {
        if (showNotice) new Notice(error?.message || '读取当前笔记失败。');
        return false;
    } finally {
        isContextLoading.value = false;
    }
};

const toggleContext = async () => {
    if (contextEnabled.value) {
        contextEnabled.value = false;
        contextLabel.value = '';
        contextContent.value = '';
        contextFilePath.value = '';
        return;
    }
    contextEnabled.value = true;
    const ok = await loadCurrentNoteContext(true);
    if (!ok) {
        contextEnabled.value = false;
    }
};

const removeContext = () => {
    contextEnabled.value = false;
    contextLabel.value = '';
    contextContent.value = '';
    contextFilePath.value = '';
};

const refreshContextSilently = async () => {
    const ok = await loadCurrentNoteContext(false);
    if (!ok) {
        contextLabel.value = '';
        contextContent.value = '';
        contextFilePath.value = '';
    }
};

const updateCodeThemeClass = () => {
    const container = answerContainerRef.value?.closest('.ai-writing-vault-view');
    if (!container) return;
    container.classList.remove('ai-writing-vault-code-light', 'ai-writing-vault-code-dark');
    const theme = props.plugin.settings.CODE_THEME === 'dark' ? 'ai-writing-vault-code-dark' : 'ai-writing-vault-code-light';
    container.classList.add(theme);
};

const renderCodeHighlight = (container: HTMLElement) => {
    const blocks = container.querySelectorAll('pre code');
    blocks.forEach((block) => {
        try {
            hljs.highlightElement(block as HTMLElement);
        } catch (error) {
            // ignore highlighting errors per block
        }
    });
};

const ensureMathJax = async () => {
    const win = window as any;
    if (win.MathJax?.typesetPromise) return;
    if (!mathJaxPromise) {
        mathJaxPromise = (async () => {
            win.MathJax = win.MathJax || {
                tex: {
                    inlineMath: [['$', '$'], ['\\(', '\\)']],
                    displayMath: [['$$', '$$'], ['\\[', '\\]']],
                    processEscapes: true
                },
                options: {
                    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
                }
            };
            await import('mathjax-full/es5/tex-chtml.js');
        })();
    }
    await mathJaxPromise;
};

const renderMath = async (container: HTMLElement, runId: number) => {
    const engine = props.plugin.settings.MATH_ENGINE || 'katex';
    if (engine === 'mathjax') {
        await ensureMathJax();
        if (runId !== renderSequence) return;
        const win = window as any;
        if (win.MathJax?.typesetPromise) {
            await win.MathJax.typesetPromise([container]);
        } else if (win.MathJax?.typeset) {
            win.MathJax.typeset([container]);
        }
        return;
    }

    const { default: renderMathInElement } = await import('katex/contrib/auto-render');
    if (runId !== renderSequence) return;
    renderMathInElement(container, {
        delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
    });
};

const renderMermaid = async (container: HTMLElement, runId: number) => {
    const codeBlocks = Array.from(container.querySelectorAll('pre > code.language-mermaid, code.language-mermaid'));
    if (codeBlocks.length === 0) return;
    const { default: mermaid } = await import('mermaid');
    if (runId !== renderSequence) return;
    const theme = props.plugin.settings.CODE_THEME === 'dark' ? 'dark' : 'default';
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme });

    const nodes: HTMLElement[] = [];
    codeBlocks.forEach((code) => {
        const pre = code.parentElement;
        const mermaidContainer = document.createElement('div');
        mermaidContainer.className = 'mermaid';
        mermaidContainer.textContent = code.textContent || '';
        nodes.push(mermaidContainer);
        if (pre && pre.parentElement) {
            pre.parentElement.replaceChild(mermaidContainer, pre);
        } else {
            code.replaceWith(mermaidContainer);
        }
    });

    await mermaid.run({ nodes });
};

const scrollToFocusedMessage = () => {
    const targetId = promptStore.focusedMessageId;
    if (!targetId) return;
    const container = answerContainerRef.value;
    if (!container) return;
    const anchor = container.querySelector(`#ai-thread-${targetId}`) as HTMLElement | null;
    if (!anchor) return;
    anchor.scrollIntoView({ block: 'start', behavior: 'smooth' });
    promptStore.clearFocus?.();
};

const postProcessRender = async (container: HTMLElement, runId: number) => {
    updateCodeThemeClass();
    await renderMermaid(container, runId);
    if (runId !== renderSequence) return;
    await renderMath(container, runId);
    if (runId !== renderSequence) return;
    renderCodeHighlight(container);
};

const renderMarkdown = async (markdown: string) => {
    const container = answerContainerRef.value;
    if (!container) return;
    const runId = ++renderSequence;
    container.empty();
    await MarkdownRenderer.render(
        props.plugin.app,
        markdown,
        container,
        '/',
        getMarkdownView()
    );
    if (runId !== renderSequence) return;
    await postProcessRender(container, runId);
    scrollToFocusedMessage();
};

let streamRenderTimer: number | null = null;
let streamRenderId = 0;
let lastStreamRenderAt = 0;
let lastStreamRenderLength = 0;

const renderStreamMarkdown = async (markdown: string) => {
    const container = answerContainerRef.value;
    if (!container) return;
    const runId = ++streamRenderId;
    const shouldScroll = container.scrollHeight - container.scrollTop - container.clientHeight < 80;
    container.empty();
    await MarkdownRenderer.render(
        props.plugin.app,
        markdown,
        container,
        '/',
        getMarkdownView()
    );
    if (runId !== streamRenderId) return;
    if (shouldScroll) {
        container.scrollTop = container.scrollHeight;
    }
    scrollToFocusedMessage();
};

const handleSettingsChanged = () => {
    updateCodeThemeClass();
    const nextKey = props.plugin.settings.API_KEY || '';
    const nextUrl = props.plugin.settings.API_URL || '';
    if (nextKey !== lastApiKey || nextUrl !== lastApiUrl) {
        lastApiKey = nextKey;
        lastApiUrl = nextUrl;
        if (nextKey) {
            loadModels();
        } else {
            modelOptions.value = [];
            chatModel.value = '';
        }
    }
    if (isLoading.value) return;
    if (historyAnswer.value) {
        renderMarkdown(historyAnswer.value);
    }
};

const startResize = (e: MouseEvent) => {
    isResizingInput.value = true;
    resizeStartY = e.clientY;
    resizeStartHeight = inputPanelHeight.value;
    document.body.style.cursor = 'row-resize';
    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', stopResize);
};

const handleResize = (e: MouseEvent) => {
    if (!isResizingInput.value) return;
    const delta = resizeStartY - e.clientY;
    const nextHeight = resizeStartHeight + delta;
    inputPanelHeight.value = Math.max(160, Math.min(nextHeight, 360));
};

const stopResize = () => {
    isResizingInput.value = false;
    document.body.style.cursor = '';
    window.removeEventListener('mousemove', handleResize);
    window.removeEventListener('mouseup', stopResize);
};

watch(chatModel, (value) => {
    if (modelQuery.value !== value) {
        modelQuery.value = value || '';
    }
});

watch(modelQuery, (value) => {
    chatModel.value = value;
    if (modelFilterTimer) {
        window.clearTimeout(modelFilterTimer);
    }
    modelFilterTimer = window.setTimeout(() => {
        modelFilterQuery.value = value;
    }, 150);
});
watch(historyAnswer, async () => {
    if (isLoading.value) return;
    if (historyAnswer.value) {
        await renderMarkdown(historyAnswer.value);
        return;
    }
    const container = answerContainerRef.value;
    if (container) {
        container.empty();
    }
});

const openModelList = () => {
    isModelListOpen.value = true;
    if (modelOptions.value.length === 0 && props.plugin.settings.API_KEY) {
        loadModels();
    }
};

const scheduleCloseModelList = () => {
    window.setTimeout(() => {
        isModelListOpen.value = false;
    }, 120);
};

const selectModel = (model: string) => {
    chatModel.value = model;
    modelQuery.value = model;
    isModelListOpen.value = false;
};

const filteredModelOptions = computed(() => {
    const query = modelFilterQuery.value.trim().toLowerCase();
    const list = query
        ? modelOptions.value.filter((item) => item.toLowerCase().includes(query))
        : modelOptions.value;
    return list.slice(0, modelListLimit);
});

const sanitizeModelOutput = (text: string) => {
    if (!text) return text;
    return text
        // Remove common reasoning blocks
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/<analysis>[\s\S]*?<\/analysis>/gi, '')
        .replace(/<\/?think>/gi, '')
        .replace(/<\/?analysis>/gi, '')
        // Remove vendor namespaced tags like <grok:render ...>...</grok:render>
        .replace(/<([a-zA-Z][\w-]*):([\w-]+)[\s\S]*?<\/\1:\2>/g, '')
        .replace(/<\/?[a-zA-Z][\w-]*:[^>]*>/g, '')
        .trim();
};

const isSeparatorLine = (line: string) => {
    return /^\s*\|?\s*:?-{3,}[\s\-:|]*\|?\s*$/.test(line);
};

const ensureRowPipes = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed.includes('|')) return line;
    let result = line;
    if (!trimmed.startsWith('|')) {
        result = `|${result}`;
    }
    if (!trimmed.endsWith('|')) {
        result = `${result}|`;
    }
    return result;
};

const countColumns = (headerLine: string) => {
    const parts = headerLine.split('|');
    if (parts.length <= 1) return 1;
    let start = 0;
    let end = parts.length;
    if (parts[0].trim() === '') start += 1;
    if (parts[parts.length - 1].trim() === '') end -= 1;
    const count = Math.max(1, end - start);
    return count;
};

const buildSeparator = (headerLine: string) => {
    const cols = countColumns(headerLine);
    return `|${Array.from({ length: cols }).map(() => ' --- ').join('|')}|`;
};

const normalizeTableBlocks = (text: string) => {
    if (!text) return text;
    const lines = text.split('\n');
    const output: string[] = [];
    let inCode = false;
    let inTable = false;

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const trimmed = line.trim();

        if (trimmed.startsWith('```')) {
            inCode = !inCode;
            inTable = false;
            output.push(line);
            continue;
        }

        if (inCode) {
            output.push(line);
            continue;
        }

        if (inTable) {
            if (!trimmed || !trimmed.includes('|')) {
                inTable = false;
                output.push(line);
                continue;
            }
            output.push(ensureRowPipes(line));
            continue;
        }

        if (trimmed.includes('|')) {
            const nextLine = lines[i + 1] ?? '';
            if (isSeparatorLine(nextLine)) {
                output.push(ensureRowPipes(line));
                output.push(ensureRowPipes(nextLine));
                inTable = true;
                i += 1;
                continue;
            }
            if (nextLine.includes('|')) {
                output.push(ensureRowPipes(line));
                output.push(buildSeparator(line));
                inTable = true;
                continue;
            }
        }

        output.push(line);
    }

    return output.join('\n');
};

const encodeGraphviz = (input: string) => {
    return encodeURIComponent(input)
        .replace(/%22/g, '"') // keep double quotes
        .replace(/%27/g, "'"); // keep single quotes
};

const normalizeGraphvizBlocks = (text: string) => {
    if (!text) return text;
    const parts = text.split('```');
    for (let i = 0; i < parts.length; i += 2) {
        parts[i] = parts[i].replace(/(^|\n)(digraph|graph)\s*\{[\s\S]*?\}\s*/g, (match) => {
            const block = match.trim();
            return `\n\`\`\`graphviz\n${block}\n\`\`\`\n`;
        });
    }
    return parts.join('```');
};

const renderGraphvizBlocks = (text: string) => {
    if (!text) return text;
    return text.replace(/```(?:graphviz|dot)\s*([\s\S]*?)```/gi, (_, body) => {
        const code = (body || '').trim();
        if (!code) return '';
        const encoded = encodeGraphviz(code);
        const url = `https://quickchart.io/graphviz?graph=${encoded}`;
        return `![流程图](${url})\n[点击跳转或右键复制链接](${url})`;
    });
};

const formatForDisplay = (text: string) => {
    const cleaned = sanitizeModelOutput(text || '');
    const withTables = normalizeTableBlocks(cleaned);
    return renderGraphvizBlocks(normalizeGraphvizBlocks(withTables));
};

const formatForStream = (text: string) => {
    const cleaned = sanitizeModelOutput(text || '');
    return normalizeTableBlocks(cleaned);
};

const getSystemPrompt = () => {
    return (props.plugin.settings.SYSTEM_PROMPT || '').trim();
};

const buildThreadMarkdown = (messages: any[], pending?: { prompt: string; answer: string; reasoning?: string }) => {
    const full = pending ? [...messages, pending] : messages;
    if (!full.length) return '';
    return full.map((m: any, index: number) => {
        const anchor = m.id_timestamp ? `<span id="ai-thread-${m.id_timestamp}"></span>\n` : '';
        const title = `**Q${index + 1}:** ${m.prompt}`;
        const answer = formatForDisplay(m.answer || '');
        const reasoning = thinkingEnabled.value && m.reasoning ? `\n\n> 💭 ${formatForDisplay(m.reasoning)}` : '';
        return `${anchor}${title}\n\n${answer}${reasoning}`;
    }).join('\n\n---\n\n');
};

const buildThreadMarkdownStream = (messages: any[], pending?: { prompt: string; answer: string; reasoning?: string }) => {
    const full = pending ? [...messages, pending] : messages;
    if (!full.length) return '';
    const pendingIndex = pending ? full.length - 1 : -1;
    return full.map((m: any, index: number) => {
        const anchor = m.id_timestamp ? `<span id="ai-thread-${m.id_timestamp}"></span>\n` : '';
        const title = `**Q${index + 1}:** ${m.prompt}`;
        const isPending = index === pendingIndex;
        const answer = isPending ? formatForStream(m.answer || '') : formatForDisplay(m.answer || '');
        const reasoning = thinkingEnabled.value && m.reasoning
            ? `\n\n> 💭 ${isPending ? formatForStream(m.reasoning) : formatForDisplay(m.reasoning)}`
            : '';
        return `${anchor}${title}\n\n${answer}${reasoning}`;
    }).join('\n\n---\n\n');
};

const startNewChat = () => {
    promptStore.startNewThread?.();
    inputContent.value = '';
    hasResponse.value = false;
    isThinking.value = false;
    const container = answerContainerRef.value;
    if (container) {
        container.empty();
    }
};

const toggleThinking = () => {
    thinkingEnabled.value = !thinkingEnabled.value;
    const thread = promptStore.getCurrentThread?.();
    if (thread && Array.isArray(thread.messages)) {
        const markdown = buildThreadMarkdown(thread.messages);
        renderMarkdown(markdown);
    }
};

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        handleSubmitHotkey();
    }
};

const handleSubmitHotkey = () => {
    if (!isLoading.value && inputContent.value.trim()) {
        submit();
    }
};

const normalizeBaseURL = (raw?: string) => {
    const fallback = 'https://api.deepseek.com';
    const trimmed = (raw || '').trim();
    const withScheme = trimmed && !/^https?:\/\//i.test(trimmed) ? `https://${trimmed}` : trimmed;
    const input = withScheme || fallback;
    try {
        const parsed = new URL(input);
        const trimmedPath = parsed.pathname.replace(/\/+$/, '');
        if (!trimmedPath || trimmedPath === '/') {
            parsed.pathname = '/v1';
        } else if (!trimmedPath.includes('/v1')) {
            parsed.pathname = `${trimmedPath}/v1`;
        }
        return parsed.toString().replace(/\/+$/, '');
    } catch (error) {
        const cleaned = input.replace(/\/+$/, '');
        if (cleaned.includes('/v1')) {
            return cleaned;
        }
        return `${cleaned}/v1`;
    }
}

const formatRequestError = (error: any) => {
    const status = error?.status || error?.response?.status;
    const rawMessage = error?.message || String(error || 'Unknown error');
    const lowerMessage = rawMessage.toLowerCase();
    if (status === 503 || lowerMessage.includes('cpu overloaded') || lowerMessage.includes('overloaded')) {
        return `服务繁忙（503）：系统过载，请稍后重试或更换模型/节点。\n\n原始错误：${rawMessage}`;
    }
    if (status === 429 || lowerMessage.includes('rate limit')) {
        return `请求过于频繁（429）：请稍后重试或降低请求频率。\n\n原始错误：${rawMessage}`;
    }
    if (status === 401 || status === 403) {
        return `鉴权失败（${status}）：请检查 API Key 或权限。\n\n原始错误：${rawMessage}`;
    }
    if (status) {
        return `请求失败（${status}）：${rawMessage}`;
    }
    return rawMessage;
};

const buildClient = () => {
    const apiKey = props.plugin.settings.API_KEY;
    const baseURL = normalizeBaseURL(props.plugin.settings.API_URL);
    if (!apiKey) {
        throw new Error('API key is missing. Please set it in plugin settings.');
    }
    return new OpenAI({
        apiKey,
        baseURL,
        dangerouslyAllowBrowser: true
    });
}

const extractModelIds = (payload: any) => {
    let data: any[] = [];
    if (Array.isArray(payload)) {
        data = payload;
    } else if (Array.isArray(payload?.data)) {
        data = payload.data;
    } else if (Array.isArray(payload?.models)) {
        data = payload.models;
    } else if (Array.isArray(payload?.result)) {
        data = payload.result;
    } else if (Array.isArray(payload?.data?.data)) {
        data = payload.data.data;
    } else if (payload?.data && typeof payload.data === 'object') {
        data = [payload.data];
    } else if (payload && typeof payload === 'object') {
        data = [payload];
    }
    return data
        .map((model: any) => model?.id)
        .filter((id: any) => typeof id === 'string' && id.length > 0);
}

const fetchModelsViaRest = async () => {
    const apiKey = props.plugin.settings.API_KEY;
    const baseURL = normalizeBaseURL(props.plugin.settings.API_URL);
    const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey}`
    };
    const initialUrl = new URL(`${baseURL}/models`);
    if (!initialUrl.searchParams.has('limit')) {
        initialUrl.searchParams.set('limit', '1000');
    }
    let url = initialUrl.toString();
    const ids = new Set<string>();
    let guard = 0;

    while (url && guard < 20) {
        guard += 1;
        const response = await fetch(url, { method: 'GET', headers });
        if (!response.ok) {
            throw new Error(`Models request failed (${response.status})`);
        }
        const json = await response.json();
        extractModelIds(json).forEach((id) => ids.add(id));

        if (typeof json?.next === 'string' && json.next.length > 0) {
            url = json.next;
            continue;
        }
        if (typeof json?.links?.next === 'string' && json.links.next.length > 0) {
            url = json.links.next;
            continue;
        }
        if (json?.has_more && (json?.last_id || json?.lastId)) {
            const cursor = json.last_id || json.lastId;
            const nextUrl = new URL(initialUrl.toString());
            nextUrl.searchParams.set('after', cursor);
            url = nextUrl.toString();
            continue;
        }
        if (typeof json?.page === 'number' && typeof json?.total_pages === 'number' && json.page < json.total_pages) {
            const nextUrl = new URL(initialUrl.toString());
            nextUrl.searchParams.set('page', String(json.page + 1));
            url = nextUrl.toString();
            continue;
        }
        url = '';
    }

    return Array.from(ids);
}

const loadModels = async () => {
    if (isLoadingModels.value) return;
    isLoadingModels.value = true;
    try {
        modelOptions.value = [];
        let ids = await fetchModelsViaRest();
        if (ids.length === 0) {
            const openai = buildClient();
            const page: any = openai.models.list();
            if (page && typeof page[Symbol.asyncIterator] === 'function') {
                for await (const model of page) {
                    if (model?.id) ids.push(model.id);
                }
            } else {
                const response: any = await page;
                ids = extractModelIds(response);
                if (page?.hasNextPage && page?.getNextPage) {
                    let current = page;
                    while (current?.hasNextPage?.()) {
                        current = await current.getNextPage();
                        ids = ids.concat(extractModelIds(current));
                    }
                }
            }
        }
        ids = ids.filter((id) => typeof id === 'string' && id.length > 0);
        ids = Array.from(new Set(ids)).sort((a, b) => a.localeCompare(b));

        if (ids.length === 0) {
            throw new Error('No models returned from the API.');
        }

        modelOptions.value = ids;
        if (!chatModel.value) {
            chatModel.value = ids[0];
        }
    } catch (error: any) {
        const message = error?.message || 'Failed to load models.';
        new Notice(message);
        modelOptions.value = [];
        if (!chatModel.value) {
            chatModel.value = '';
        }
    } finally {
        isLoadingModels.value = false;
    }
};

onMounted(() => {
    updateCodeThemeClass();
    document.addEventListener('ai-writing-vault:settings-changed', handleSettingsChanged);
    lastApiKey = props.plugin.settings.API_KEY || '';
    lastApiUrl = props.plugin.settings.API_URL || '';
    lastMarkdownFile = props.plugin.app.workspace.getActiveFile?.() ?? ((props.plugin.app.workspace.getLeavesOfType?.('markdown') || [])[0] as any)?.view?.file ?? null;
    if (props.plugin.settings.API_KEY) {
        loadModels();
    }
    activeLeafRef = props.plugin.app.workspace.on('active-leaf-change', (leaf) => {
        const view: any = leaf?.view;
        if (view?.getViewType?.() === 'markdown' && view?.file) {
            lastMarkdownFile = view.file;
        }
        if (contextEnabled.value) {
            refreshContextSilently();
        }
    });
    modifyFileRef = props.plugin.app.vault.on('modify', (file) => {
        if (contextEnabled.value && file?.path && file.path === contextFilePath.value) {
            refreshContextSilently();
        }
    });
});

onUnmounted(() => {
    document.removeEventListener('ai-writing-vault:settings-changed', handleSettingsChanged);
    stopResize();
    if (activeLeafRef) {
        props.plugin.app.workspace.offref(activeLeafRef);
        activeLeafRef = null;
    }
    if (modifyFileRef) {
        props.plugin.app.vault.offref(modifyFileRef);
        modifyFileRef = null;
    }
});

const submit = async () => {
    const container = answerContainerRef.value;
    if(container) container.empty();
    isLoading.value = true;  // 开始加载
    isThinking.value = true;
    hasResponse.value = false;

    try {
        if (!chatModel.value) {
            throw new Error('Model is missing. Please choose or input a model.');
        }

        if (contextEnabled.value && !contextContent.value) {
            await loadCurrentNoteContext(false);
        }

        const openai = buildClient();
        const thread = promptStore.getCurrentThread?.();
        const previousMessages = thread && Array.isArray(thread.messages) ? thread.messages : [];
        const baseMessages = (() => {
            if (!thread || !Array.isArray(thread.messages)) {
                return [];
            }
            return thread.messages.flatMap((m: any) => ([
                { role: "user", content: m.prompt },
                { role: "assistant", content: m.answer }
            ]));
        })();

        let fullResponse = '';
        let fullReasoning = '';
        const doStreamRender = async () => {
            lastStreamRenderAt = Date.now();
            lastStreamRenderLength = fullResponse.length;
            const markdown = buildThreadMarkdownStream(previousMessages, {
                prompt: inputContent.value,
                answer: fullResponse,
                reasoning: fullReasoning
            });
            await renderStreamMarkdown(markdown);
        };

        const scheduleStreamRender = () => {
            const now = Date.now();
            const lengthDelta = fullResponse.length - lastStreamRenderLength;
            const timeDelta = now - lastStreamRenderAt;

            if (lengthDelta >= 40 || timeDelta >= 120) {
                if (streamRenderTimer) {
                    window.clearTimeout(streamRenderTimer);
                    streamRenderTimer = null;
                }
                void doStreamRender();
                return;
            }

            if (streamRenderTimer) return;
            streamRenderTimer = window.setTimeout(async () => {
                streamRenderTimer = null;
                await doStreamRender();
            }, 80);
        };

        await renderStreamMarkdown(buildThreadMarkdownStream(previousMessages, {
            prompt: inputContent.value,
            answer: '',
            reasoning: ''
        }));
        const systemPrompt = getSystemPrompt();
        const contextMessage = contextEnabled.value && contextContent.value
            ? {
                role: "system",
                content: `Context from current note (${contextLabel.value || 'Untitled'}):\n\n${contextContent.value}`
            }
            : null;
        const messages = [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            ...(contextMessage ? [contextMessage] : []),
            ...baseMessages,
            { role: "user", content: inputContent.value }
        ];

        const completion = await openai.chat.completions.create({
            messages,
            model: chatModel.value,
            stream: true
        });

        // 处理流式响应
        for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta || {};
            const content = delta?.content || '';
            const reasoning = delta?.reasoning_content || delta?.reasoning || '';
            if (reasoning) {
                fullReasoning += reasoning;
            }
            if (content) {
                fullResponse += content;
                if (isThinking.value) {
                    isThinking.value = false;
                }
                scheduleStreamRender();
            }
        }

            if (fullResponse) {
                const cleanedAnswer = sanitizeModelOutput(fullResponse);
                const cleanedReasoning = thinkingEnabled.value ? sanitizeModelOutput(fullReasoning) : undefined;
                if (streamRenderTimer) {
                    window.clearTimeout(streamRenderTimer);
                    streamRenderTimer = null;
                }
                streamRenderId += 1;
                lastStreamRenderAt = 0;
                lastStreamRenderLength = 0;
                // 保存对话到 store
                await promptStore.addPrompt(inputContent.value, cleanedAnswer, cleanedReasoning)
            if (container) {
                const finalThread = promptStore.getCurrentThread?.();
                const finalMessages = Array.isArray(finalThread?.messages) ? finalThread.messages : [];
                const markdown = buildThreadMarkdown(finalMessages);
                await renderMarkdown(markdown);
            }
            // 清空输入框
            inputContent.value = '';
            hasResponse.value = true;
        }
    } catch (error: any) {
        isThinking.value = false;
        // console.log('---Error:', error);
        if(container) {
            await renderMarkdown(formatRequestError(error));
        }
    } finally {
        isLoading.value = false;  // 结束加载
        isThinking.value = false;
    }
}
</script>

<style scoped>
/* 确保 Markdown 内容也可以选择 */
.answer-field :deep(*) {
    user-select: text;
    -webkit-user-select: text;
}

/* 滚动条样式 */
.answer-field::-webkit-scrollbar {
    width: 6px;
}
.answer-field::-webkit-scrollbar-track {
    background: transparent;
}
.answer-field::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
}

.answer-field :deep(table) {
    width: 100%;
    margin: 8px 0;
    font-size: 13px;
    border-collapse: separate;
    border-spacing: 0;
    border: 1px solid var(--background-modifier-border);
    border-radius: 10px;
    overflow: hidden;
}

.answer-field :deep(th),
.answer-field :deep(td) {
    padding: 6px 8px;
    vertical-align: top;
    border-right: 1px solid var(--background-modifier-border);
    border-bottom: 1px solid var(--background-modifier-border);
}

.answer-field :deep(th:last-child),
.answer-field :deep(td:last-child) {
    border-right: none;
}

.answer-field :deep(tr:last-child td) {
    border-bottom: none;
}

.answer-field :deep(th) {
    background: var(--apple-bg-secondary);
    font-weight: 600;
}

</style>
