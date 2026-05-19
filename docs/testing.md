# Testing

## 当前验证入口

```sh
just check
just build
```

`just build` 是当前可用的构建验证入口。`just check` 运行 `svelte-kit sync` 和 `svelte-check`，但截至 2026-05-19 仍会暴露上游遗留的 TypeScript / a11y 债，不能作为绿色闸门。

当前已知 `just check` 主要失败面：

- `src/lib/index.ts`: `debounce` 缺少显式类型。
- `src/lib/utils/graph.ts`: 图布局函数缺少节点 / 边类型。
- `src/components/KnowledgeBoard.svelte`: JS 脚本块缺少 props、DOM 引用和图数据类型。
- `src/components/settings/ApiSetting.svelte`: provider 字符串索引类型不收敛。
- 多个 Svelte 组件存在 a11y warning。

## 手动冒烟

1. `just dev` 启动应用。
2. 打开本地 URL。
3. 上传一个 PDF。
4. 选择目录页范围。
5. 使用手动目录或自带 API Key 生成 ToC。
6. 预览并导出 PDF。
7. 打开导出的 PDF，确认 outline、实体目录页、页码偏移和章节导出符合预期。

## 建议补测范围

- `src/lib/utils/toc.ts`: JSON 修复、层级归一化、无效 ToC 过滤。
- `src/lib/pdf/page-labels.ts`: 分段页码写入。
- `src/lib/pdf/chapter-export.ts`: 章节范围、合并导出、边界页码。
- `src/lib/llm/core.ts`: provider 选择、错误消息解析、JSON payload 提取。
