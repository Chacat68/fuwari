// SEO优化工具函数

/**
 * 优化文章标题，使其更SEO友好
 * @param title 原始标题
 * @param options 优化选项
 */
export function optimizeTitle(
	title: string,
	options: {
		maxLength?: number;
		addKeywords?: string[];
		addSiteTitle?: boolean;
		siteTitle?: string;
	} = {},
): string {
	const {
		maxLength = 60,
		addKeywords = [],
		addSiteTitle = true,
		siteTitle = "Fuwari",
	} = options;

	let optimizedTitle = title.trim();

	// 添加关键词（如果标题中没有包含）
	addKeywords.forEach((keyword) => {
		if (!optimizedTitle.toLowerCase().includes(keyword.toLowerCase())) {
			optimizedTitle = `${optimizedTitle} - ${keyword}`;
		}
	});

	// 添加网站标题
	if (addSiteTitle && !optimizedTitle.includes(siteTitle)) {
		optimizedTitle = `${optimizedTitle} | ${siteTitle}`;
	}

	// 确保标题长度不超过限制
	if (optimizedTitle.length > maxLength) {
		const truncateLength = maxLength - 3; // 为省略号留空间
		optimizedTitle = `${optimizedTitle.substring(0, truncateLength)}...`;
	}

	return optimizedTitle;
}

/**
 * 生成SEO友好的描述
 * @param content 内容
 * @param maxLength 最大长度
 */
export function generateDescription(content: string, maxLength = 160): string {
	// 移除HTML标签
	const cleanContent = content.replace(/<[^>]*>/g, "");

	// 移除多余的空白字符
	const normalizedContent = cleanContent.replace(/\s+/g, " ").trim();

	// 截取指定长度
	if (normalizedContent.length <= maxLength) {
		return normalizedContent;
	}

	// 在单词边界处截断
	const truncated = normalizedContent.substring(0, maxLength);
	const lastSpaceIndex = truncated.lastIndexOf(" ");

	if (lastSpaceIndex > maxLength * 0.8) {
		return `${truncated.substring(0, lastSpaceIndex)}...`;
	}

	return `${truncated}...`;
}

/**
 * 提取内容中的关键词
 * @param content 内容
 * @param maxKeywords 最大关键词数量
 */
export function extractKeywords(content: string, maxKeywords = 10): string[] {
	// 移除HTML标签和标点符号
	const cleanContent = content
		.replace(/<[^>]*>/g, "")
		.replace(/[^\w\s\u4e00-\u9fff]/g, " ")
		.toLowerCase();

	// 分词
	const words = cleanContent.split(/\s+/).filter((word) => word.length > 2);

	// 统计词频
	const wordCount = new Map();
	words.forEach((word) => {
		wordCount.set(word, (wordCount.get(word) || 0) + 1);
	});

	// 排序并返回高频词
	return Array.from(wordCount.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, maxKeywords)
		.map(([word]) => word);
}

/**
 * 生成结构化数据的面包屑
 * @param items 面包屑项目
 */
export function generateBreadcrumbStructuredData(
	items: Array<{ name: string; url: string }>,
): Record<string, any> {
	return {
		"@context": "https://schema.org" as const,
		"@type": "BreadcrumbList" as const,
		itemListElement: items.map(
			(
				item,
				index,
			): {
				"@type": "ListItem";
				position: number;
				name: string;
				item: string;
			} => ({
				"@type": "ListItem" as const,
				position: index + 1,
				name: item.name,
				item: item.url,
			}),
		),
	};
}

/**
 * 生成文章的结构化数据
 * @param article 文章数据
 */
export function generateArticleStructuredData(article: {
	title: string;
	description: string;
	author: string;
	publishedDate: string;
	modifiedDate?: string;
	image?: string;
	tags?: string[];
	url: string;
	wordCount?: number;
}): Record<string, any> {
	const structuredData: Record<string, any> = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: article.title,
		description: article.description,
		author: {
			"@type": "Person",
			name: article.author,
		},
		datePublished: article.publishedDate,
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": article.url,
		},
	};

	if (article.modifiedDate) {
		structuredData.dateModified = article.modifiedDate;
	}

	if (article.image) {
		structuredData.image = {
			"@type": "ImageObject",
			url: article.image,
		};
	}

	if (article.tags && article.tags.length > 0) {
		structuredData.keywords = article.tags.join(", ");
	}

	if (article.wordCount) {
		structuredData.wordCount = article.wordCount;
	}

	return structuredData;
}

/**
 * 验证和清理URL
 * @param url 原始URL
 */
export function sanitizeUrl(url: string): string {
	try {
		const urlObj = new URL(url);
		return urlObj.href;
	} catch {
		// 如果不是完整URL，假设是相对路径
		return url.startsWith("/") ? url : `/${url}`;
	}
}

/**
 * 生成社交媒体分享URL
 * @param platform 平台
 * @param data 分享数据
 */
export function generateShareUrl(
	platform: "twitter" | "facebook" | "linkedin" | "weibo",
	data: {
		url: string;
		title: string;
		description?: string;
	},
): string {
	const encodedUrl = encodeURIComponent(data.url);
	const encodedTitle = encodeURIComponent(data.title);
	const _encodedDescription = data.description
		? encodeURIComponent(data.description)
		: "";

	switch (platform) {
		case "twitter":
			return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
		case "facebook":
			return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
		case "linkedin":
			return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
		case "weibo":
			return `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`;
		default:
			return data.url;
	}
}

/**
 * 计算阅读时间（分钟）
 * @param content 内容
 * @param wordsPerMinute 每分钟阅读字数
 */
export function calculateReadingTime(
	content: string,
	wordsPerMinute = 200,
): number {
	// 移除HTML标签
	const cleanContent = content.replace(/<[^>]*>/g, "");

	// 计算字数（支持中英文）
	const chineseChars = (cleanContent.match(/[\u4e00-\u9fff]/g) || []).length;
	const englishWords = cleanContent
		.replace(/[\u4e00-\u9fff]/g, "")
		.split(/\s+/)
		.filter((word) => word.length > 0).length;

	// 中文字符按1个字计算，英文单词按1个词计算
	const totalWords = chineseChars + englishWords;

	return Math.ceil(totalWords / wordsPerMinute);
}

/**
 * 生成页面的canonical URL
 * @param path 页面路径
 * @param baseUrl 基础URL
 */
export function generateCanonicalUrl(path: string, baseUrl: string): string {
	// 确保baseUrl不以/结尾
	const cleanBaseUrl = baseUrl.replace(/\/$/, "");
	// 确保path以/开头
	const cleanPath = path.startsWith("/") ? path : `/${path}`;

	return `${cleanBaseUrl}${cleanPath}`;
}

/**
 * 检查内容是否包含敏感词
 * @param content 内容
 * @param sensitiveWords 敏感词列表
 */
export function containsSensitiveWords(
	content: string,
	sensitiveWords: string[] = [],
): boolean {
	const lowerContent = content.toLowerCase();
	return sensitiveWords.some((word) =>
		lowerContent.includes(word.toLowerCase()),
	);
}

/**
 * 生成页面的meta标签
 * @param data 页面数据
 */
export function generateMetaTags(data: {
	title: string;
	description: string;
	keywords?: string[];
	author?: string;
	image?: string;
	url: string;
	type?: string;
	lang?: string;
}): Array<{ name?: string; property?: string; content: string }> {
	const metaTags: Array<{ name?: string; property?: string; content: string }> =
		[
			{ name: "title", content: data.title },
			{ name: "description", content: data.description },
			{ property: "og:title", content: data.title },
			{ property: "og:description", content: data.description },
			{ property: "og:url", content: data.url },
			{ property: "og:type", content: data.type || "website" },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: data.title },
			{ name: "twitter:description", content: data.description },
		];

	if (data.keywords && data.keywords.length > 0) {
		metaTags.push({ name: "keywords", content: data.keywords.join(", ") });
	}

	if (data.author) {
		metaTags.push({ name: "author", content: data.author });
	}

	if (data.image) {
		metaTags.push(
			{ property: "og:image", content: data.image },
			{ name: "twitter:image", content: data.image },
		);
	}

	if (data.lang) {
		metaTags.push({ property: "og:locale", content: data.lang });
	}

	return metaTags;
}
