import type { APIRoute } from "astro";

// 处理常见的URL重定向和404问题
export const GET: APIRoute = async ({ request, redirect }) => {
	const url = new URL(request.url);
	const pathname = url.pathname;

	// 处理常见的错误URL模式
	const redirects = [
		// 处理 /article/ 路径到 /posts/ 的重定向
		{
			from: /^\/article\/(.+)$/,
			to: "/posts/$1/",
			status: 301,
		},
		// 处理缺失的 /look 页面
		{
			from: /^\/look\/?$/,
			to: "/",
			status: 301,
		},
		// 处理 /cdn-cgi/l/email-protection 路径
		{
			from: /^\/cdn-cgi\/l\/email-protection\/?$/,
			to: "/",
			status: 301,
		},
		// 处理其他可能的错误路径
		{
			from: /^\/posts\/(ai3|diary9|design2|design6)\/?$/,
			to: "/archive/",
			status: 301,
		},
	];

	// 检查是否需要重定向
	for (const redirectRule of redirects) {
		const match = pathname.match(redirectRule.from);
		if (match) {
			let targetUrl = redirectRule.to;

			// 处理带参数的替换
			if (match.length > 1) {
				for (let i = 1; i < match.length; i++) {
					targetUrl = targetUrl.replace(`$${i}`, match[i]);
				}
			}

			return redirect(targetUrl, redirectRule.status);
		}
	}

	// 如果没有匹配的重定向规则，返回404
	return new Response("Not Found", { status: 404 });
};
