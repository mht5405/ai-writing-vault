import { Plugin, WorkspaceLeaf, Notice, ObsidianProtocolData } from "obsidian";
import "./tailwind.css";
import "katex/dist/katex.min.css";
import "./highlight-theme.css";
import { AIWritingVault_SettingTab } from "./setting-tab";
import {SettingsInterfaceType, DEFAULT_SETTINGS} from './settings'  // 导入设置接口类型
import { AIWritingVault_ItemView } from "./my-itemview";

export default class Plugin_AI_Writing_Vault extends Plugin {
    // private vueApp: ReturnType<typeof createApp> | null = null; // 创建vue应用实例

    settings:SettingsInterfaceType = DEFAULT_SETTINGS;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new AIWritingVault_SettingTab(this.app, this));
        this.registerView("ai-writing-vault-itemview", (leaf) => new AIWritingVault_ItemView(leaf, this));
        this.addRibbonIcon("bot", "Open AI Writing Vault", () => {
            this.activateView();
        });

        this.addCommand({
            id: 'open-ai-writing-vault',
            name: 'Open AI Writing Vault',
            callback: () => {
                this.activateView();
            }
        });

        this.registerObsidianProtocolHandler("ai-writing-vault", async (params: ObsidianProtocolData) => {
            if (params.action === "ai-writing-vault" && params.id) {
                this.handleOpenChat(params.id);
            }
        });
        
    }
    onunload() {
    }

    async handleOpenChat(id: string) {
        await this.activateView();
        const leaf = this.app.workspace.getLeavesOfType("ai-writing-vault-itemview")[0];
        if (leaf && leaf.view instanceof AIWritingVault_ItemView) {
            leaf.view.openChat(id);
        }
    }

    async loadSettings(){
        this.settings = Object.assign({},DEFAULT_SETTINGS,await this.loadData());
    }

    async saveSettings(){
        await this.saveData(this.settings);
        document.dispatchEvent(new CustomEvent("ai-writing-vault:settings-changed", { detail: this.settings }));
    }
    async activateView(){
        const {workspace} = this.app;
        let leaf:WorkspaceLeaf|null = workspace.getLeavesOfType("ai-writing-vault-itemview")[0];
        if (!leaf){
            leaf = workspace.getRightLeaf(false);
            // let leaf = workspace.getLeaf('split', 'vertical');
            if (leaf){
                await leaf.setViewState({
                    type: "ai-writing-vault-itemview",
                    active: true,
                });
            }
        }
        if (leaf){
            workspace.revealLeaf(leaf); // 聚焦到视图
        }else{
            new Notice("无法找到视图");
        }
        
    }
}
