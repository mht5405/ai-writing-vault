/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  // 使用 important 选项将所有 Tailwind 工具类限定在插件容器内
  // 这样生成的 CSS 规则会变成 .ai-writing-vault-view .flex { ... }
  // 从而彻底避免影响 Obsidian 的其他部分
  important: '.ai-writing-vault-view',
  theme: {
    extend: {
      colors: {
        'apple-blue': '#4F46E5',
        'apple-gray': '#F5F5F7',
      }
    },
  },
  corePlugins: {
    preflight: false, // 禁用默认样式重置，避免冲突
  },
  plugins: [],
}
