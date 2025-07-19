import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";

export type SiteConfig = {
	title: string;
	subtitle: string;

	lang: string;

	themeColor: {
		hue: number;
		fixed: boolean;
	};
	defaultPostImage?: string; // 没有图片的文章将使用此默认网络图片
	banner: {
		enable: boolean;
		src: string;
		position?: "top" | "center" | "bottom";
		credit: {
			enable: boolean;
			text: string;
			url?: string;
		};
	};
	toc: {
		enable: boolean;
		depth: 1 | 2 | 3;
	};

	favicon: Favicon[];
};

export type Favicon = {
	src: string;
	theme?: "light" | "dark";
	sizes?: string;
};

export enum LinkPreset {
	Home = 0,
	Archive = 1,
	About = 2,
}

export type NavBarLink = {
	name: string;
	url: string;
	external?: boolean;
};

export type NavBarConfig = {
	links: (NavBarLink | LinkPreset)[];
};

export type ProfileConfig = {
	avatar?: string;
	name: string;
	bio?: string;
	links: {
		name: string;
		url: string;
		icon: string;
	}[];
};

export type LicenseConfig = {
	enable: boolean;
	name: string;
	url: string;
};

export type LIGHT_DARK_MODE =
	| typeof LIGHT_MODE
	| typeof DARK_MODE
	| typeof AUTO_MODE;

export type BlogPostData = {
	body: string;
	title: string;
	published: Date;
	description: string;
	tags: string[];
	draft?: boolean;
	image?: string;
	category?: string;
	prevTitle?: string;
	prevSlug?: string;
	nextTitle?: string;
	nextSlug?: string;
};

export type ExpressiveCodeConfig = {
	theme: string;
};

// X平台API配置类型
export type XTwitterConfig = {
	enable: boolean; // 是否启用X平台集成
	username?: string; // X平台用户名
	apiKey?: string; // X平台API密钥
	apiSecret?: string; // X平台API密钥
	accessToken?: string; // 访问令牌
	accessTokenSecret?: string; // 访问令牌密钥
	bearerToken?: string; // Bearer令牌（推荐使用）
	maxTweets?: number; // 最大获取推文数量，默认10
	cacheTime?: number; // 缓存时间（分钟），默认30分钟
};

// Threads API配置类型
export type ThreadsConfig = {
	enable: boolean; // 是否启用Threads集成
	username?: string; // Threads用户名
	accessToken?: string; // Threads访问令牌
	maxPosts?: number; // 最大获取帖子数量，默认10
	cacheTime?: number; // 缓存时间（分钟），默认30分钟
	fallbackToMock?: boolean; // API失败时是否使用模拟数据
};
