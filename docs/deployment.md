# Vercel 部署

Tocify 当前使用 `@sveltejs/adapter-vercel` 和 Node.js 22，适合直接部署到 Vercel。域名也由 Vercel 托管时，不需要额外配置 Cloudflare DNS。

## 导入项目

在 Vercel 控制台导入 GitHub 仓库 `Yalyenea/tocify`：

- Production branch: `main`
- Framework preset: `SvelteKit`
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Node.js: `22.x`

Vercel 会为每次推送创建预览部署；合并到 `main` 后更新生产部署。

## 环境变量

在 Project Settings > Environment Variables 中配置服务端变量。不要把真实 key 写入 `.env.example` 或提交到仓库。

必要变量：

- `AI_PROVIDER`
- 对应 provider 的 API key 和文本 / 视觉模型变量
- `CUSTOM_PROVIDER_NAME` / `CUSTOM_BASE_URL` / `CUSTOM_API_KEY`（仅 custom provider）
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`

用户在界面中填写自己的 API Key 时，请求会从浏览器直连 provider；未填写时才使用 Vercel Function 中的服务端 key 和 Upstash 限流。

## 域名

在 Vercel 项目的 Settings > Domains 中添加已经托管在 Vercel 的域名。建议先绑定 `tocify.<你的域名>`，验证页面、`/api/models`、`/api/process-toc` 和 PDF 导出后，再决定是否把根域名指向 Tocify。

## 上线前验证

```sh
just build
```

然后在 Vercel Preview 中验证：

- PDF 打开、目录编辑和导出
- 用户自带 API Key 的直连调用
- 服务端 API Key 的目录解析和知识看板
- `/api/models` 模型列表获取
- 未配置或超出 Upstash 限流时的错误提示
