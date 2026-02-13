# AI Writing Vault for Obsidian

A focused AI workspace inside Obsidian to ask, track, and reuse conversations as searchable knowledge assets.

> This project is a **second‑phase upgrade** based on the original repo: [mali-i/deepseek-ai-assistant](https://github.com/mali-i/deepseek-ai-assistant/blob/main/README.md)

---

## 中文

AI Writing Vault 是一个在 Obsidian 内使用的 AI 工作台，帮助你记录提问、管理对话线程，并将日常问题沉淀为可搜索的知识资产。

### 本项目新增/升级内容
- 更统一的高端极简 UI 设计与交互优化。
- OpenAI 兼容接口完善（DeepSeek / OpenAI / 第三方），模型自动发现 + 手动输入。
- 上下文感知：一键引用当前笔记作为上下文，支持取消。
- 对话线程化 + New 分支。
- 历史时间线 + 全量搜索 + 删除功能。
- 边生成边渲染（更快首字反馈），并保持最终完整 Markdown 渲染。
- 表格渲染容错增强与圆角表格样式。
- Graphviz 自动识别渲染 + Mermaid 渲染。
- 数学渲染引擎切换（KaTeX / MathJax）。
- 代码高亮主题切换（Light / Dark）。
- 思考模式显示（可选）。
- 快捷键：Cmd/Ctrl + Enter 发送。

### 截图位置（请替换为实际效果图）
- 主界面：`![Main](./images/shot-main.png)`
- 对话线程：`![Thread](./images/shot-thread.png)`
- 上下文引用：`![Context](./images/shot-context.png)`
- 渲染展示（表格/公式/图表）：`![Render](./images/shot-render.png)`

### 设置项
- API Key
- API URL（自动补全 /v1）
- System Prompt
- 数学渲染引擎：KaTeX / MathJax
- 代码高亮主题：Light / Dark

### 数据与隐私
- 所有记录保存在本地 `data.json`
- 不上传历史记录

---

## English

AI Writing Vault is a focused AI workspace inside Obsidian that helps you ask, track, and reuse conversations as searchable knowledge assets.

### What’s upgraded in this fork
- Premium, minimal UI redesign with cleaner interactions.
- Improved OpenAI‑compatible support (DeepSeek / OpenAI / third‑party), model auto discovery + manual input.
- Context Awareness: attach current note, with quick removal.
- Threaded conversations + New branching.
- Timeline + full‑history search + delete.
- Live streaming render with final Markdown polish.
- Table rendering fixes + rounded table style.
- Graphviz auto‑render + Mermaid.
- Switchable math engines (KaTeX / MathJax).
- Switchable code highlight themes (Light / Dark).
- Optional reasoning display.
- Shortcut: Cmd/Ctrl + Enter to send.

### Screenshot placeholders
- Main view: `![Main](./images/shot-main.png)`
- Threaded chat: `![Thread](./images/shot-thread.png)`
- Context usage: `![Context](./images/shot-context.png)`
- Rendering (tables/math/diagrams): `![Render](./images/shot-render.png)`

### Settings
- API Key
- API URL (auto appends /v1)
- System Prompt
- Math engine: KaTeX / MathJax
- Code theme: Light / Dark

### Data
- All data is stored locally in `data.json`
- No history is uploaded

Author: Lirio
