import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import swup from "@swup/astro";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components"; /* Render the custom directive content */
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive"; /* Handle directives */
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";
import { expressiveCodeConfig } from "./src/config.ts";
import { pluginCustomCopyButton } from "./src/plugins/expressive-code/custom-copy-button.js";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge.ts";
import { AdmonitionComponent } from "./src/plugins/rehype-component-admonition.mjs";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
	site:
		process.env.NODE_ENV === "development"
			? "http://localhost:4321/"
			: "https://www.chawfoo.com/",
	base: "/",
	trailingSlash: "always",
	compressHTML: true,
	image: {
		domains: ["blog-1259751088.cos.ap-shanghai.myqcloud.com"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "blog-1259751088.cos.ap-shanghai.myqcloud.com",
			},
		],
		// 使用 noop 服务跳过远程图片优化，避免构建时网络超时
		service:
			process.env.NODE_ENV === "production"
				? { entrypoint: "astro/assets/services/noop" }
				: { entrypoint: "astro/assets/services/sharp" },
	},
	build: {
		inlineStylesheets: "auto",
	},
	integrations: [
		tailwind({
			nesting: true,
		}),
		swup({
			theme: false,
			animationClass: "transition-", // see https://swup.js.org/options/#animationselector
			// 使用默认值以避免404错误
			containers: ["main", "#toc"],
			smoothScrolling: true,
			cache: true,
			preload: {
				enabled: true,
				customFetch: (url) => {
					return fetch(url, {
						credentials: "same-origin", // 设置凭证模式
						mode: "cors",
						headers: {
							"X-Requested-With": "XMLHttpRequest",
						},
					});
				},
			},
			accessibility: true,
			updateHead: true,
			updateBodyClass: false,
			globalInstance: true,
		}),
		icon({
			include: {
				"fa6-brands": ["twitter", "bluesky", "github", "creative-commons"],
				"fa6-regular": ["address-card"],
				"fa6-solid": [
					"arrow-up-right-from-square",
					"arrow-rotate-left",
					"chevron-right",
					"rss",
				],
				"material-symbols": [
					"home-outline-rounded",
					"archive-outline-rounded",
					"dashboard-rounded",
					"group-outline-rounded",
					"person-outline-rounded",
					"architecture-rounded",
					"interests-outline-rounded",
					"link",
					"palette-outline",
					"wb-sunny-outline-rounded",
					"dark-mode-outline-rounded",
					"radio-button-partial-outline",
					"menu-rounded",
					"search",
					"search-rounded",
					"error-outline-rounded",
					"arrow-forward-rounded",
					"arrow-back-rounded",
					"copyright-outline-rounded",
					"calendar-today-outline-rounded",
					"edit-calendar-outline-rounded",
					"book-2-outline-rounded",
					"tag-rounded",
					"keyboard-arrow-up-rounded",
					"chevron-right-rounded",
					"chevron-left-rounded",
					"more-horiz",
					"map-outline",
					"notes-rounded",
					"schedule-outline-rounded",
				],
			},
		}),

		expressiveCode({
			themes: [expressiveCodeConfig.theme, expressiveCodeConfig.theme],
			plugins: [
				pluginCollapsibleSections(),
				pluginLineNumbers(),
				pluginLanguageBadge(),
				pluginCustomCopyButton(),
			],
			defaultProps: {
				wrap: true,
				overridesByLang: {
					shellsession: {
						showLineNumbers: false,
					},
				},
			},
			styleOverrides: {
				codeBackground: "var(--codeblock-bg)",
				borderRadius: "0.75rem",
				borderColor: "none",
				codeFontSize: "0.875rem",
				codeFontFamily:
					"'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
				codeLineHeight: "1.5rem",
				frames: {
					editorBackground: "var(--codeblock-bg)",
					terminalBackground: "var(--codeblock-bg)",
					terminalTitlebarBackground: "var(--codeblock-topbar-bg)",
					editorTabBarBackground: "var(--codeblock-topbar-bg)",
					editorActiveTabBackground: "none",
					editorActiveTabIndicatorBottomColor: "var(--primary)",
					editorActiveTabIndicatorTopColor: "none",
					editorTabBarBorderBottomColor: "var(--codeblock-topbar-bg)",
					terminalTitlebarBorderBottomColor: "none",
				},
				textMarkers: {
					delHue: 0,
					insHue: 180,
					markHue: 250,
				},
			},
			frames: {
				showCopyToClipboardButton: false,
			},
		}),
		svelte(),
		sitemap(),
	],
	markdown: {
		remarkPlugins: [
			remarkMath,
			remarkReadingTime,
			remarkExcerpt,
			remarkGithubAdmonitionsToDirectives,
			remarkDirective,
			remarkSectionize,
			parseDirectiveNode,
		],
		rehypePlugins: [
			rehypeKatex,
			rehypeSlug,
			[
				rehypeExternalLinks,
				{
					content: false,
					target: "_blank",
					rel: ["nofollow", "noopener", "noreferrer"],
				},
			],
			[
				rehypeComponents,
				{
					components: {
						github: GithubCardComponent,
						note: (x, y) => AdmonitionComponent(x, y, "note"),
						tip: (x, y) => AdmonitionComponent(x, y, "tip"),
						important: (x, y) => AdmonitionComponent(x, y, "important"),
						caution: (x, y) => AdmonitionComponent(x, y, "caution"),
						warning: (x, y) => AdmonitionComponent(x, y, "warning"),
					},
				},
			],
			[
				rehypeAutolinkHeadings,
				{
					behavior: "append",
					properties: {
						className: ["anchor"],
					},
					content: {
						type: "element",
						tagName: "span",
						properties: {
							className: ["anchor-icon"],
							"data-pagefind-ignore": true,
						},
						children: [
							{
								type: "text",
								value: "#",
							},
						],
					},
				},
			],
		],
	},
	vite: {
		// 配置远程资源请求超时
		server: {
			fs: {
				strict: false,
			},
		},
		build: {
			cssCodeSplit: true,
			minify: "esbuild",
			rollupOptions: {
				onwarn(warning, warn) {
					// temporarily suppress this warning
					if (
						warning.message.includes("is dynamically imported by") &&
						warning.message.includes("but also statically imported by")
					) {
						return;
					}
					warn(warning);
				},
				output: {
					manualChunks: (id) => {
						// 将大型依赖分离到单独的chunk
						if (id.includes("overlayscrollbars")) {
							return "overlayscrollbars";
						}
						if (id.includes("photoswipe")) {
							return "photoswipe";
						}
						if (id.includes("katex")) {
							return "katex";
						}
						if (id.includes("swup")) {
							return "swup";
						}
					},
				},
			},
		},
	},
});
