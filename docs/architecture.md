# Architecture

## 总览

Tocify 是 SvelteKit 单页工具，主流程集中在 `src/routes/+page.svelte`：

1. 加载 PDF。
2. 选择目录页范围。
3. 从页面图片或手动文本生成 ToC。
4. 编辑目录树、页码偏移、样式和 page labels。
5. 写入 PDF outline、实体目录页，并导出完整 PDF 或章节。

## 目录结构

- `src/routes/+page.svelte`: 主应用状态和工作流编排。
- `src/routes/api/process-toc/+server.ts`: 服务端 ToC 解析接口。
- `src/routes/api/generate-board/+server.ts`: 服务端知识看板生成接口。
- `src/lib/llm/core.ts`: provider 统一调用、JSON 提取和 ToC 标准化入口。
- `src/lib/llm/client.ts`: 浏览器直连 provider，用于用户自带 API Key。
- `src/lib/llm/server.ts`: 服务端 provider/key 解析。
- `src/lib/pdf/service.ts`: PDF 加载、渲染、字体和文档写入。
- `src/lib/pdf/outliner.ts`: PDF outline 写入。
- `src/lib/pdf/chapter-export.ts`: 章节范围计算与导出。
- `src/lib/pdf/page-labels.ts`: PDF page labels 写入。
- `src/lib/utils/toc.ts`: ToC 解析、清洗、提示词和结构归一化。
- `src/components/`: 编辑器、预览区、设置、弹窗和辅助 UI。
- `static/pdf.worker*.mjs`: pdf.js worker 静态文件。

## 客户端 / 服务端边界

- PDF 文件主体留在浏览器本地处理。
- AI ToC 生成会把选中目录页渲染为图片。
- 用户在界面输入 API Key 时，请求从浏览器直连 provider。
- 未提供用户 API Key 时，请求走 SvelteKit API，由服务端环境变量提供 key，并通过 Upstash 限流。

## OCR / AI Provider

- 目录页 OCR 实际是视觉 LLM 解析：`PDFService.getPageAsImage()` 将选中 PDF 页渲染为 JPEG data URL，`generateToc()` 再按 8 页一组发送到 LLM。
- `src/lib/llm/core.ts` 统一处理文本目录解析、图片目录解析和知识图谱生成。
- Gemini 走 Google `generateContent`；Qwen、Doubao、Zhipu 和自定义 provider 走 OpenAI-compatible `/chat/completions`。
- API 设置支持分别配置文本模型和视觉模型。文本模型用于 AI Format 和知识图谱；视觉模型用于 PDF 目录页识别。
- 自定义 provider 需要提供 Base URL、API Key、文本模型和视觉模型。
- API 设置可以拉取 provider 模型列表：Gemini 使用原生 `GET /v1beta/models`，OpenAI-compatible provider 使用 `GET <baseUrl>/models`，返回后供文本模型和视觉模型输入框选择。

## 文件保存

- 支持 File System Access API 的浏览器会优先用系统文件选择器打开 PDF，并保存原始 `FileSystemFileHandle`。
- 导出完整 PDF 时，如果存在原文件 handle，会先询问是否直接替换原文件。
- 选择不替换时，保存对话框会尽量从原文件位置开始，并默认建议 `<原文件名>_outlined.pdf`。
- 拖拽上传、传统文件 input 或不支持 File System Access API 的浏览器拿不到原文件写入权限，只能走另存或浏览器下载。

## 已清理边界

这个 fork 不再保留上游的 SEO 页面、站点地图、站点验证、统计 SDK、客户端下载推广、star 弹窗、赞助图片和 README 演示素材。后续若要重新加入部署或增长相关功能，应作为独立变更引入。
