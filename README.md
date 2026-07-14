# Tocify

Tocify 是一个 SvelteKit PDF 工具，用于提取、编辑和写入 PDF 目录 / 书签，并支持生成实体目录页、章节导出和基于目录的知识看板。

这个 fork 已清理上游宣传、SEO、站点验证、统计和演示素材，保留面向本地维护的核心应用与开发文档。

## 快速开始

```sh
pnpm install
just dev
```

常用命令：

```sh
just check
just build
just preview
```

## 文档

- [开发说明](docs/development.md)
- [Vercel 部署](docs/deployment.md)
- [架构说明](docs/architecture.md)
- [验证与测试](docs/testing.md)
- [变更记录](CHANGELOG.md)

## 技术栈

- SvelteKit / Svelte 5 / TypeScript / Vite
- Tailwind CSS
- pdf.js / pdf-lib
- Gemini、Qwen、Doubao、Zhipu 兼容的 LLM 目录解析
