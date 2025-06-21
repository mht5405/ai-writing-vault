import { App, PluginSettingTab, Setting } from "obsidian";

import Plugin_Deepseek_AI_Assistant from "./main";
// import SettingTabTemplate from "./components/SettingTabTemplate.vue";

export class DeepSeekAIAssistant_SettingTab extends PluginSettingTab {
    plugin: Plugin_Deepseek_AI_Assistant;
    constructor(app: App, plugin: Plugin_Deepseek_AI_Assistant) {
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
            .setDesc('Get your API key from https://platform.deepseek.com')
            .addText(text => text
                .setValue(this.plugin.settings.API_KEY)
                .onChange(async (value) => {
                    this.plugin.settings.API_KEY = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName('API URL')
            .setDesc('The default API server address which does not need to be modified')
            .addText(text => text
                .setPlaceholder('https://api.openai.com/v1')
                .setValue(this.plugin.settings.API_URL)
                .onChange(async (value) => {
                    this.plugin.settings.API_URL = value;
                    await this.plugin.saveSettings();
                }));
    }
}
