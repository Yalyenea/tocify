# Development

## 环境

- Node.js >= 22
- pnpm 9.15.9
- just

如果本机没有 pnpm：

```sh
npm install -g pnpm@9.15.9
```

## 安装与启动

```sh
pnpm install
just dev
```

默认开发服务由 Vite 启动。需要预览生产构建时运行：

```sh
just build
just preview
```

## 环境变量

复制 `.env.example` 为 `.env`，按需填写：

- `AI_PROVIDER`: 服务端默认 provider，支持 `gemini`、`qwen`、`doubao`、`zhipu`、`custom`
- `GOOGLE_API_KEY`: Gemini
- `DASHSCOPE_API_KEY`: Qwen
- `ZHIPU_API_KEY`: Zhipu
- `DOUBAO_API_KEY`: Doubao
- `GEMINI_MODEL` / `GEMINI_VISION_MODEL`: Gemini 文本和视觉模型
- `QWEN_TEXT_MODEL` / `QWEN_VISION_MODEL`: Qwen 文本和视觉模型
- `ZHIPU_TEXT_MODEL` / `ZHIPU_VISION_MODEL`: Zhipu 文本和视觉模型
- `DOUBAO_TEXT_MODEL` / `DOUBAO_VISION_MODEL`: Doubao 文本和视觉 Endpoint ID
- `CUSTOM_PROVIDER_NAME` / `CUSTOM_BASE_URL` / `CUSTOM_API_KEY`: OpenAI-compatible 自定义 provider
- `CUSTOM_TEXT_MODEL` / `CUSTOM_VISION_MODEL`: 自定义 provider 的文本和视觉模型
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`: 服务端内置 key 路径的限流存储

用户在界面中填入 API Key 时，目录解析会直接从浏览器请求对应模型，不依赖服务端 key。自定义 provider 需要兼容 OpenAI `/chat/completions` 请求格式。

模型列表获取同样优先走用户 Key 的浏览器直连；未填写用户 Key 时走 `/api/models` 并使用服务端环境变量。自定义 provider 的模型列表需要兼容 OpenAI `/models` 请求格式。

## 开发约定

- 用 `just` 作为命令入口。
- 当前可用的构建闸门是 `just build`；`just check` 会暴露上游遗留的 TypeScript / a11y 债，适合作为后续修复清单。
- 不把临时文件放在项目根目录；临时输出放入 `.tmp/`，移除的内容放入 `.tmp/trash/`。
- 新功能优先补充小而集中的测试；当前仓库主要验证入口见 `docs/testing.md`。
