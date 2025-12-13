# Copilot Instructions (fuwari)

## 项目概览
- 这是一个基于 **Astro 5** 的静态博客模板，UI 由 **Astro + Svelte 5** 组件组成，样式使用 **TailwindCSS**。
- 包管理器强制使用 **pnpm**（见 `package.json#preinstall`），运行环境要求 **Node >= 20**。
- 站点/SEO/Markdown 渲染链路在 `astro.config.mjs`（生产 `site` 当前为 `https://www.chawfoo.com/`）；站点个性化配置集中在 `src/config.ts`。
- 组件选型：页面/静态布局优先用 `.astro`；需要交互的控件用 Svelte（例如 `src/components/Search.svelte`）。

## 关键目录与数据流
- 内容源：`src/content/`（Astro Content Collections）
  - Schema：`src/content/config.ts`
  - 文章：`src/content/posts/**`（frontmatter 字段以 schema 为准；`draft` 在生产构建中会被过滤，开发环境不过滤，见 `src/utils/content-utils.ts`）
  - 友链/项目：`src/content/friends/`、`src/content/projects/`
- 路由：`src/pages/**`
  - 列表分页：`src/pages/[...page].astro`（`paginate(getSortedPosts(), { pageSize })`）
  - 文章详情：`src/pages/posts/[...slug].astro`（`entry.render()` 得到 `Content`/`headings`）
  - RSS/robots/重定向：`src/pages/rss.xml.ts`、`src/pages/robots.txt.ts`、`src/pages/_redirects.ts`
- 布局：`src/layouts/Layout.astro`（全局 meta/主题初始化）+ `src/layouts/MainGridLayout.astro`（Navbar/Banner/Sidebar/Toc/slot）

## 约定与实现细节（很重要）
- URL 统一走 `src/utils/url-utils.ts` 的 `url()`/`getPostUrlBySlug()` 等，项目设置了 `trailingSlash: "always"`，不要手写不带 `/` 的站内链接。
- `getSortedPosts()` 会在运行时补齐 `prev/next` 字段到 `entry.data`（见 `src/utils/content-utils.ts`），文章页会直接读取这些字段。
- 文章封面：`src/pages/posts/[...slug].astro` 总是渲染封面；若 frontmatter 未提供 `image` 会回退到 `siteConfig.defaultPostImage`。

## Markdown/插件链
- Markdown 管线配置在 `astro.config.mjs`：
  - remark：数学公式、excerpt、reading-time、GitHub admonitions → directives（实现见 `src/plugins/remark-*.{js,mjs}`）
  - rehype：KaTeX、slug、外链属性、directive 组件渲染（admonition/github card，见 `src/plugins/rehype-component-*.mjs`）
- 代码块高亮/增强使用 `astro-expressive-code`，定制插件在 `src/plugins/expressive-code/*`。

## 搜索（Pagefind）
- 搜索只在生产构建可用：`pnpm build` 会执行 `pagefind --site dist` 生成索引。
- 生产环境下 `src/components/Navbar.astro` 动态加载 `/pagefind/pagefind.js` 并派发 `pagefindready`/`pagefindloaderror` 事件；`src/components/Search.svelte` 监听这些事件初始化。
- 开发模式下搜索会使用 mock 结果（不要误判为真实索引问题）。

## 常用命令（从根目录执行）
- `pnpm dev`：本地开发（Astro dev server）
- `pnpm check`：`astro check`
- `pnpm type-check`：`tsc --noEmit --isolatedDeclarations`
- `pnpm build`：`astro build && pagefind --site dist`
- `pnpm preview`：预览构建产物（用于验证 Pagefind 等生产行为）
- `pnpm new-post <filename>`：生成新文章（脚本：`scripts/new-post.js`）

## 代码风格与工具
- 使用 Biome：`pnpm format` / `pnpm lint`；缩进风格为 **tab**，JS/TS 字符串偏好 **double quotes**（见 `biome.json`）。
- TS 路径别名见 `tsconfig.json`（如 `@components/*`、`@utils/*`、`@i18n/*`）。
