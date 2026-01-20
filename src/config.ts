import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "付之一笑",
	subtitle: "阅读、思考、写作",
	metaDescription:
		"CHACAT 的个人博客，记录游戏开发与前端开发实践，分享阅读思考、摄影与内容创作笔记，持续写作与复盘。",
	lang: "zh_CN", // 'en'、'zh_CN'、'zh_TW'、'ja'、'ko'、'es'、'th'
	keywords: [
		"游戏开发",
		"前端开发",
		"内容创作",
		"摄影",
		"阅读",
		"思考",
		"写作",
	],
	theme: {
		// 是否启用基于时间的自动切换（6:00/18:00）
		timeBasedSwitch: false,
	},
	themeColor: {
		hue: 260, // 主题颜色的默认色调，范围从0到360。例如：红色：0，青色：200，蓝青色：250，粉色：345
		fixed: true, // 对访问者隐藏主题颜色选择器
	},
	defaultPostImage:
		"https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20251215012146838.webp?imageSlim", // 没有图片的文章将使用此默认网络图片
	banner: {
		enable: true,
		src: "https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20251215003435129.webp?imageSlim", // 相对于/src目录。如果以'/'开头，则相对于/public目录
		position: "center", // 等同于object-position，仅支持'top'、'center'、'bottom'。默认为'center'
		credit: {
			enable: false, // 显示横幅图片的署名文本
			text: "CHACAT绘制", // 要显示的署名文本
			url: "", // （可选）原始作品或艺术家页面的URL链接
		},
	},
	toc: {
		enable: true, // 在文章右侧显示目录
		depth: 3, // 在目录中显示的最大标题深度，范围从1到3
	},
	favicon: [
		// 将此数组留空以使用默认图标
		// {
		//   src: '/favicon/icon.png',    // 图标路径，相对于/public目录
		//   theme: 'light',              // （可选）'light'或'dark'，仅当您有不同的明暗模式图标时设置
		//   sizes: '32x32',              // （可选）图标的尺寸，仅当您有不同尺寸的图标时设置
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		{
			name: "项目",
			url: "/projects/",
		},
		{
			name: "友链", // 暂时使用硬编码值，避免循环依赖
			url: "/friends/",
		},
		LinkPreset.About,
	],
};

export const profileConfig: ProfileConfig = {
	avatar:
		"https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250330115218086.png?imageSlim", // 相对于/src目录。如果以'/'开头，则相对于/public目录
	name: "CHACAT",
	bio: "日常在阅读、创作、跑步。",
	links: [
		{
			name: "X/Twitter",
			icon: "fa6-brands:twitter", // 访问 https://icones.js.org/ 获取图标代码
			// 如果尚未包含相应的图标集，您需要安装它
			// `pnpm add @iconify-json/<图标集名称>`
			url: "https://x.com/Chacat68",
		},
		{
			name: "Bluesky",
			icon: "fa6-brands:bluesky",
			url: "https://chacat68.bsky.social",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/Chacat68",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
