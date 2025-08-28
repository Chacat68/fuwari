import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";
import { siteConfig } from "../config";

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		const isDraftFilter = import.meta.env.PROD ? data.draft !== true : true;
		// 过滤未来日期的文章
		const today = new Date();
		today.setHours(23, 59, 59, 999); // 设置为今天的最后一刻
		const isFutureDate = new Date(data.published) > today;
		
		return isDraftFilter && !isFutureDate;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type PostForList = {
	slug: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		slug: post.slug,
		data: post.data,
	}));

	return sortedPostsList;
}

// 获取所有文章的总数（包括未来日期的文章，但不包括草稿）
export async function getAllPostsCount(): Promise<number> {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		// 只过滤草稿文章，不过滤未来日期的文章
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	return allBlogPosts.length;
}

// 获取所有文章（包括未来日期的文章，但不包括草稿）
export async function getAllPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		// 只过滤草稿文章，不过滤未来日期的文章
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	return allBlogPosts;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.map((post: { data: { tags: string[] } }) => {
		post.data.tags.map((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.map((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	// 根据配置决定排序方式
	let lst: string[];
	
	if (siteConfig.categorySort?.enable && siteConfig.categorySort.order.length > 0) {
		// 使用自定义排序
		const customOrder = siteConfig.categorySort.order;
		const fallbackSort = siteConfig.categorySort.fallbackSort || "count";
		
		lst = Object.keys(count).sort((a, b) => {
			const indexA = customOrder.indexOf(a);
			const indexB = customOrder.indexOf(b);
			
			if (indexA !== -1 && indexB !== -1) {
				return indexA - indexB; // 按自定义顺序
			}
			if (indexA !== -1) {
				return -1; // a 在自定义列表中，排在前面
			}
			if (indexB !== -1) {
				return 1; // b 在自定义列表中，排在前面
			}
			// 都不在自定义列表中，使用fallback排序
			if (fallbackSort === "alphabetical") {
				return a.toLowerCase().localeCompare(b.toLowerCase());
			}
			return count[b] - count[a]; // 按文章数量降序
		});
	} else {
		// 默认按文章数量降序排序
		lst = Object.keys(count).sort((a, b) => {
			return count[b] - count[a];
		});
	}

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}
