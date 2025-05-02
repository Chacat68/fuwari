import type {
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "付之一笑",
	subtitle: "阅读、思考、写作",
	lang: "zh_CN", // 'en'、'zh_CN'、'zh_TW'、'ja'、'ko'、'es'、'th'
	themeColor: {
		hue: 250, // 主题颜色的默认色调，范围从0到360。例如：红色：0，青色：200，蓝青色：250，粉色：345
		fixed: true, // 对访问者隐藏主题颜色选择器
	},
	defaultPostImage:
		"https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250501123146419.png?imageSlim", // 没有图片的文章将使用此默认网络图片
	banner: {
		enable: true,
		src: "https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250501122847733.png?imageSlim", // 相对于/src目录。如果以'/'开头，则相对于/public目录
		position: "center", // 等同于object-position，仅支持'top'、'center'、'bottom'。默认为'center'
		credit: {
			enable: false, // 显示横幅图片的署名文本
			text: "", // 要显示的署名文本
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
		{
			name: "Hobby",
			url: "https://neodb.social/users/Charliefoo/", // 内部链接不应包含基本路径，因为它会自动添加
			external: true, // 显示外部链接图标并在新标签页中打开
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar:
		"https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250330115218086.png?imageSlim", // 相对于/src目录。如果以'/'开头，则相对于/public目录
	name: "CHACAT",
	bio: "日常在阅读、创作、跑步。",
	links: [
		{
			name: "Bluesky",
			icon: "fa6-brands:bluesky", // 访问 https://icones.js.org/ 获取图标代码
			// 如果尚未包含相应的图标集，您需要安装它
			// `pnpm add @iconify-json/<图标集名称>`
			url: "https://x.com/Chacat68",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
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
