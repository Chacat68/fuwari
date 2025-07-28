import type { APIRoute } from "astro";

const robotsTxt = `
User-agent: *
Allow: /
Disallow: /_astro/
Disallow: /api/
Disallow: /*.json$
Disallow: /admin/
Disallow: /draft/

# 允许搜索引擎访问重要页面
Allow: /posts/
Allow: /about/
Allow: /archive/
Allow: /projects/
Allow: /rss.xml

# 爬取延迟（可选）
Crawl-delay: 1

# Sitemap位置
Sitemap: ${new URL("sitemap-index.xml", import.meta.env.SITE).href}
Sitemap: ${new URL("rss.xml", import.meta.env.SITE).href}
`.trim();

export const GET: APIRoute = () => {
	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
};
