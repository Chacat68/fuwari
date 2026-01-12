/**
 * 预计算的文章元数据缓存
 * 由 generate-stats.js 在构建前生成
 */

interface PostMeta {
	words: number;
	minutes: number;
	excerpt: string;
}

// 动态导入预计算的元数据
let metadataCache: Record<string, PostMeta> | null = null;

async function loadMetadata(): Promise<Record<string, PostMeta>> {
	if (metadataCache) {
		return metadataCache;
	}

	try {
		// 使用 Vite 的 import 来加载 JSON
		const data = await import("../data/post-metadata.json");
		metadataCache = data.default || data;
		return metadataCache;
	} catch {
		// 如果文件不存在，返回空对象
		console.warn(
			"post-metadata.json not found, falling back to empty metadata",
		);
		metadataCache = {};
		return metadataCache;
	}
}

/**
 * 获取文章的预计算元数据
 * @param slug 文章 slug
 * @returns 元数据对象，如果不存在则返回默认值
 */
export async function getPostMetadata(slug: string): Promise<PostMeta> {
	const metadata = await loadMetadata();
	return (
		metadata[slug] || {
			words: 0,
			minutes: 0,
			excerpt: "",
		}
	);
}

/**
 * 同步获取元数据（需要先调用 loadMetadata）
 */
export function getPostMetadataSync(slug: string): PostMeta | null {
	if (!metadataCache) return null;
	return metadataCache[slug] || null;
}

/**
 * 预加载所有元数据
 */
export async function preloadMetadata(): Promise<void> {
	await loadMetadata();
}
