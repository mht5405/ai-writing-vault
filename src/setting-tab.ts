import { App, PluginSettingTab, Setting } from "obsidian";

import Plugin_AI_Writing_Vault from "./main";
// import SettingTabTemplate from "./components/SettingTabTemplate.vue";

export class AIWritingVault_SettingTab extends PluginSettingTab {
    plugin: Plugin_AI_Writing_Vault;
    constructor(app: App, plugin: Plugin_AI_Writing_Vault) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        // createApp(SettingTabTemplate,{  // 将 SampleSettingTabPage 组件作为vue应用的根组件
        //     plugin: this.plugin,   // 将 plugin 实例传递给 Vue 组件
        // }).mount(containerEl);

        new Setting(containerEl)
            .setName('API key')
            .setDesc('OpenAI-compatible API key (DeepSeek / OpenAI / third-party).')
            .addText(text => text
                .setValue(this.plugin.settings.API_KEY)
                .onChange(async (value) => {
                    this.plugin.settings.API_KEY = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName('API URL')
            .setDesc('OpenAI-compatible base URL (auto appends /v1 if missing).')
            .addText(text => text
                .setPlaceholder('https://api.openai.com/v1')
                .setValue(this.plugin.settings.API_URL)
                .onChange(async (value) => {
                    this.plugin.settings.API_URL = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('System prompt')
            .setDesc('Used as the system message for each request.')
            .addTextArea(text => {
                text.setValue(this.plugin.settings.SYSTEM_PROMPT || '')
                    .onChange(async (value) => {
                        this.plugin.settings.SYSTEM_PROMPT = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 12;
            });

        new Setting(containerEl)
            .setName('Math renderer')
            .setDesc('Choose KaTeX (fast) or MathJax (more compatible).')
            .addDropdown(dropdown => dropdown
                .addOption('katex', 'KaTeX')
                .addOption('mathjax', 'MathJax')
                .setValue(this.plugin.settings.MATH_ENGINE)
                .onChange(async (value) => {
                    this.plugin.settings.MATH_ENGINE = value as 'katex' | 'mathjax';
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Code highlight theme')
            .setDesc('Switch between light and dark code highlighting.')
            .addDropdown(dropdown => dropdown
                .addOption('light', 'Light')
                .addOption('dark', 'Dark')
                .setValue(this.plugin.settings.CODE_THEME)
                .onChange(async (value) => {
                    this.plugin.settings.CODE_THEME = value as 'light' | 'dark';
                    await this.plugin.saveSettings();
                }));
    }
}
