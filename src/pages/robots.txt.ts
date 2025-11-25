import type { APIRoute } from "astro";

const siteUrl = import.meta.env.SITE;

const robotsTxt = `
# ================================================
# Robots.txt for ${siteUrl}
# 优化 AI 爬虫和搜索引擎抓取策略
# 更新时间: 2025-11-26
# ================================================

# 通用搜索引擎 - 允许完全访问
User-agent: Googlebot
Allow: /
Disallow: /_astro/
Disallow: /api/
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Disallow: /_astro/
Disallow: /api/
Crawl-delay: 1

User-agent: Baiduspider
Allow: /
Disallow: /_astro/
Disallow: /api/
Crawl-delay: 2

User-agent: YandexBot
Allow: /
Disallow: /_astro/
Disallow: /api/
Crawl-delay: 2

User-agent: DuckDuckBot
Allow: /
Disallow: /_astro/
Disallow: /api/
Crawl-delay: 1

# ================================================
# AI 训练爬虫 - 禁止抓取用于模型训练
# ================================================

# OpenAI GPTBot (用于训练 ChatGPT)
User-agent: GPTBot
Disallow: /

# OpenAI ChatGPT User (用户通过 ChatGPT 浏览)
User-agent: ChatGPT-User
Allow: /posts/
Allow: /about/
Disallow: /

# Google AI (Bard/Gemini 训练)
User-agent: Google-Extended
Disallow: /

# Common Crawl (大规模数据集)
User-agent: CCBot
Disallow: /

# Anthropic Claude 训练爬虫
User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

# Cohere AI
User-agent: cohere-ai
Disallow: /

# Meta/Facebook AI
User-agent: FacebookBot
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /

User-agent: Meta-ExternalFetcher
Disallow: /

# Perplexity AI
User-agent: PerplexityBot
Disallow: /

# ByteDance/TikTok AI
User-agent: Bytespider
Disallow: /

# Apple AI (Applebot-Extended 用于 Apple Intelligence)
User-agent: Applebot-Extended
Disallow: /

# Omgili/Webz.io
User-agent: omgili
Disallow: /

User-agent: omgilibot
Disallow: /

# Diffbot
User-agent: Diffbot
Disallow: /

# Amazonbot
User-agent: Amazonbot
Disallow: /

# Sentibot
User-agent: Sentibot
Disallow: /

# img2dataset (图片训练)
User-agent: img2dataset
Disallow: /

# ================================================
# AI 搜索/摘要助手 - 允许有限访问（提供引用价值）
# ================================================

# Apple Siri/Spotlight
User-agent: Applebot
Allow: /posts/
Allow: /about/
Allow: /archive/
Disallow: /_astro/
Disallow: /api/
Crawl-delay: 2

# ================================================
# 其他常见爬虫
# ================================================

# SEO 工具
User-agent: Screaming Frog SEO Spider
Allow: /
Disallow: /_astro/

User-agent: AhrefsBot
Allow: /
Disallow: /_astro/
Crawl-delay: 5

User-agent: SemrushBot
Allow: /
Disallow: /_astro/
Crawl-delay: 5

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

# 社交媒体预览（允许生成链接预览）
User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: TelegramBot
Allow: /

User-agent: Slackbot
Allow: /

User-agent: WhatsApp
Allow: /

User-agent: Discordbot
Allow: /

# ================================================
# 默认规则
# ================================================
User-agent: *
Allow: /
Disallow: /_astro/
Disallow: /api/
Disallow: /pagefind/
Disallow: /*?*
Crawl-delay: 2

# ================================================
# 站点地图
# ================================================
Sitemap: ${new URL("sitemap-index.xml", siteUrl).href}

# ================================================
# Host
# ================================================
Host: ${siteUrl}
`.trim();

export const GET: APIRoute = () => {
	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=86400", // 缓存 1 天
		},
	});
};
