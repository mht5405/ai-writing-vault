import { getIcon, ItemView, WorkspaceLeaf } from "obsidian";
import Plugin_AI_Writing_Vault from "./main";
import { createApp } from "vue";
import MainTemplate from "./components/MainTemplate.vue";
import { createPinia} from 'pinia'
import { usePluginStore } from "./store/plugin";
import { usePromptStore } from "./store/prompts";

export class AIWritingVault_ItemView extends ItemView{
    plugin: Plugin_AI_Writing_Vault;
    private promptStore: any;
    private pluginStore: any;

    constructor(leaf: WorkspaceLeaf, plugin: Plugin_AI_Writing_Vault) {
        super(leaf);
        this.plugin = plugin;
    }
    getViewType(): string {
        return "ai-writing-vault-itemview"
    }
    getDisplayText(): string {
        return "AI Writing Vault"
    }
    getIcon():string {
        return "bot"
    }
    async onOpen(){
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass("ai-writing-vault-view");
        
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
