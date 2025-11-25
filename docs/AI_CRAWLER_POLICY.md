# AI 爬虫抓取策略文档

> 更新时间: 2025-11-26

## 📋 概述

本文档描述了网站 `www.chawfoo.com` 对 AI 爬虫和搜索引擎的抓取策略。策略的核心原则是：

- ✅ **允许** 搜索引擎正常索引
- ✅ **允许** 社交媒体生成链接预览
- ❌ **禁止** AI 公司将内容用于模型训练
- ⚠️ **限制** SEO 工具的抓取频率

---

## 🤖 AI 爬虫处理策略

### 完全禁止的 AI 爬虫

| 爬虫名称               | 所属公司     | 用途               | 状态   |
| ---------------------- | ------------ | ------------------ | ------ |
| `GPTBot`               | OpenAI       | 训练 ChatGPT       | ❌ 禁止 |
| `Google-Extended`      | Google       | 训练 Bard/Gemini   | ❌ 禁止 |
| `CCBot`                | Common Crawl | 大规模数据集       | ❌ 禁止 |
| `anthropic-ai`         | Anthropic    | 训练 Claude        | ❌ 禁止 |
| `Claude-Web`           | Anthropic    | Claude 网页浏览    | ❌ 禁止 |
| `cohere-ai`            | Cohere       | AI 模型训练        | ❌ 禁止 |
| `FacebookBot`          | Meta         | AI 训练            | ❌ 禁止 |
| `Meta-ExternalAgent`   | Meta         | AI 训练            | ❌ 禁止 |
| `Meta-ExternalFetcher` | Meta         | AI 训练            | ❌ 禁止 |
| `PerplexityBot`        | Perplexity   | AI 搜索            | ❌ 禁止 |
| `Bytespider`           | ByteDance    | TikTok AI          | ❌ 禁止 |
| `Applebot-Extended`    | Apple        | Apple Intelligence | ❌ 禁止 |
| `Amazonbot`            | Amazon       | Alexa AI           | ❌ 禁止 |
| `Diffbot`              | Diffbot      | 数据抽取           | ❌ 禁止 |
| `omgili` / `omgilibot` | Webz.io      | 数据采集           | ❌ 禁止 |
| `img2dataset`          | -            | 图片训练           | ❌ 禁止 |
| `Sentibot`             | -            | 情感分析           | ❌ 禁止 |

### 有限允许的 AI 爬虫

| 爬虫名称       | 允许路径                          | 说明                   |
| -------------- | --------------------------------- | ---------------------- |
| `ChatGPT-User` | `/posts/`, `/about/`              | ChatGPT 用户浏览网页时 |
| `Applebot`     | `/posts/`, `/about/`, `/archive/` | Siri/Spotlight 搜索    |

---

## 🔍 搜索引擎处理策略

### 主流搜索引擎（完全允许）

| 爬虫名称      | 搜索引擎   | Crawl-delay |
| ------------- | ---------- | ----------- |
| `Googlebot`   | Google     | 1秒         |
| `Bingbot`     | Bing       | 1秒         |
| `DuckDuckBot` | DuckDuckGo | 1秒         |
| `Baiduspider` | 百度       | 2秒         |
| `YandexBot`   | Yandex     | 2秒         |

### SEO 工具（限制频率）

| 爬虫名称                    | 工具           | Crawl-delay |
| --------------------------- | -------------- | ----------- |
| `AhrefsBot`                 | Ahrefs         | 5秒         |
| `SemrushBot`                | Semrush        | 5秒         |
| `Screaming Frog SEO Spider` | Screaming Frog | 无限制      |
| `MJ12bot`                   | Majestic       | ❌ 禁止      |
| `DotBot`                    | Moz            | ❌ 禁止      |

---

## 📱 社交媒体预览（完全允许）

以下爬虫用于生成链接分享时的预览卡片：

- `Twitterbot` (X/Twitter)
- `facebookexternalhit` (Facebook)
- `LinkedInBot` (LinkedIn)
- `TelegramBot` (Telegram)
- `Slackbot` (Slack)
- `WhatsApp` (WhatsApp)
- `Discordbot` (Discord)

---

## 🛡️ 实现方式

### 1. robots.txt

动态生成的 `robots.txt` 文件位于：
```
/src/pages/robots.txt.ts
```

### 2. Meta 标签

在 `Layout.astro` 中添加了以下 meta 标签：

```html
<!-- 通用搜索引擎设置 -->
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">

<!-- AI 爬虫专用限制 -->
<meta name="GPTBot" content="noindex, nofollow">
<meta name="Google-Extended" content="noindex, nofollow">
<meta name="CCBot" content="noindex, nofollow">
<!-- ... 更多 AI 爬虫 -->
```

### 3. 禁止访问的路径

- `/_astro/` - Astro 生成的静态资源
- `/api/` - API 端点
- `/pagefind/` - 搜索索引文件
- `/*?*` - 带查询参数的 URL（防止重复内容）

---

## 📊 效果说明

| 目标           | 预期效果             |
| -------------- | -------------------- |
| Google 搜索    | ✅ 正常收录和排名     |
| 百度搜索       | ✅ 正常收录和排名     |
| ChatGPT 训练   | ❌ 内容不会被用于训练 |
| Google AI 训练 | ❌ 内容不会被用于训练 |
| 社交分享       | ✅ 链接预览正常显示   |
| RSS 订阅       | ✅ 不受影响           |

---

## ⚠️ 注意事项

1. **robots.txt 是君子协定**：不良爬虫可能无视这些规则
2. **Meta 标签支持有限**：并非所有爬虫都支持特定 meta 标签
3. **定期更新**：新的 AI 爬虫不断出现，需要定期更新策略
4. **监控建议**：建议使用 Umami 或 Google Analytics 监控异常流量

---

## 🔗 相关资源

- [Google robots.txt 规范](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [OpenAI GPTBot 文档](https://platform.openai.com/docs/gptbot)
- [Google-Extended 公告](https://blog.google/technology/ai/an-update-on-web-publisher-controls/)
- [Dark Visitors - AI 爬虫数据库](https://darkvisitors.com/)

---

## 📝 更新日志

| 日期       | 更新内容                       |
| ---------- | ------------------------------ |
| 2025-11-26 | 初始版本，添加主流 AI 爬虫限制 |
