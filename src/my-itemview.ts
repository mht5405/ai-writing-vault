import { getIcon, ItemView, WorkspaceLeaf } from "obsidian";
import Plugin_Deepseek_AI_Assistant from "./main";
import { createApp } from "vue";
import MainTemplate from "./components/MainTemplate.vue";
import { createPinia} from 'pinia'
import { usePluginStore } from "./store/plugin";
import { usePromptStore } from "./store/prompts";

export class DeepSeekAIAssistant_ItemView extends ItemView{
    plugin: Plugin_Deepseek_AI_Assistant;
    private promptStore: any;
    private pluginStore: any;

    constructor(leaf: WorkspaceLeaf, plugin: Plugin_Deepseek_AI_Assistant) {
        super(leaf);
        this.plugin = plugin;
    }
    getViewType(): string {
        return "deepseek-ai-assistant-itemview"
    }
    getDisplayText(): string {
        return "Deepseek AI assistant"
    }
    getIcon():string {
        return "bot"
    }
    async onOpen(){
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass("deepseek-ai-assistant-view");
        
        // 确保容器占满高度
        // containerEl.addClass("deepseek-ai-view-container");
        // containerEl.style.height = "100%";
        // containerEl.style.width = "100%";
        // containerEl.style.overflow = "hidden";

        const vueApp = createApp(MainTemplate, {
            plugin: this.plugin
        })
        
        // 注册pinia
        const pinia = createPinia()
        vueApp.use(pinia)  
        
        const pluginStore = usePluginStore(pinia)  
        this.pluginStore = pluginStore;
        pluginStore.setPlugin(this.plugin)

        this.promptStore = usePromptStore(pinia);

        vueApp.mount(containerEl);
        
    }

    public openChat(id: string) {
        if (this.promptStore) {
            this.promptStore.findAndSelectPromptById(id);
        if (this.pluginStore) {
            this.pluginStore.setSidebarOpen(false);
        }
        }
    }
}