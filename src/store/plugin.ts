import { defineStore } from 'pinia';
import type MyPlugin from '../main'; // 根据实际路径调整

export const usePluginStore = defineStore('plugin', {
  state: () => ({
    plugin: null as MyPlugin | null,
    isSidebarOpen: true, // Default to open
  }),
  actions: {
    setPlugin(plugin: MyPlugin) {
      // console.log(plugin)
      this.plugin = plugin;
    },
    setSidebarOpen(isOpen: boolean) {
      this.isSidebarOpen = isOpen;
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  },
});