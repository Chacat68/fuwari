<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { url } from "@utils/url-utils.ts";
import { onMount } from "svelte";
import type { SearchResult } from "@/global";

let keywordDesktop = "";
let keywordMobile = "";
let result: SearchResult[] = []; // 初始化为空数组
let isSearching = false;
let pagefindLoaded = false;
let initialized = false;

const fakeResult: SearchResult[] = [
	{
		url: url("/"),
		meta: {
			title: "This Is a Fake Search Result",
		},
		excerpt:
			"Because the search cannot work in the <mark>dev</mark> environment.",
	},
	{
		url: url("/"),
		meta: {
			title: "If You Want to Test the Search",
		},
		excerpt: "Try running <mark>npm build && npm preview</mark> instead.",
	},
];

const togglePanel = () => {
	if (typeof document === "undefined") return;
	const panel = document.getElementById("search-panel");
	if (panel) {
		panel.classList.toggle("float-panel-closed");
	}
};

const setPanelVisibility = (show: boolean, isDesktop: boolean): void => {
	if (typeof document === "undefined") return;
	const panel = document.getElementById("search-panel");
	if (!panel || !isDesktop) return;

	if (show) {
		panel.classList.remove("float-panel-closed");
	} else {
		panel.classList.add("float-panel-closed");
	}
};

const search = async (keyword: string, isDesktop: boolean): Promise<void> => {
	if (!keyword) {
		setPanelVisibility(false, isDesktop);
		result = [];
		return;
	}

	if (!initialized) {
		return;
	}

	isSearching = true;

	try {
		let searchResults: SearchResult[] = [];

		if (import.meta.env.PROD && pagefindLoaded && window.pagefind) {
			const response = await window.pagefind.search(keyword);
			searchResults = await Promise.all(
				response.results.map((item) => item.data()),
			);
		} else if (import.meta.env.DEV) {
			searchResults = fakeResult;
		} else {
			searchResults = [];
			console.error("Pagefind is not available in production environment.");
		}

		result = searchResults;
		setPanelVisibility(result.length > 0, isDesktop);
	} catch (error) {
		console.error("Search error:", error);
		result = [];
		setPanelVisibility(false, isDesktop);
	} finally {
		isSearching = false;
	}
};

onMount(() => {
	// 确保只在浏览器环境中运行
	if (typeof window === "undefined" || typeof document === "undefined") return;

	// 延迟初始化以避免水合错误
	setTimeout(async () => {
		initialized = true;

		try {
			await initializeSearch();
		} catch (error) {
			console.error("搜索初始化失败:", error);
		}
	}, 100);

	const initializeSearch = () => {
		try {
			initialized = true;
			pagefindLoaded =
				typeof window !== "undefined" &&
				!!window.pagefind &&
				typeof window.pagefind.search === "function";
			console.log("Pagefind status on init:", pagefindLoaded);

			// 安全检查搜索关键词
			if (keywordDesktop && typeof search === "function") {
				search(keywordDesktop, true);
			}
			if (keywordMobile && typeof search === "function") {
				search(keywordMobile, false);
			}
		} catch (error) {
			console.error("Error initializing search:", error);
			initialized = true; // 即使出错也标记为已初始化，避免重复尝试
		}
	};

	// 监听 pagefind 加载完成事件
	const handlePagefindReady = () => {
		console.log("Pagefind 已准备就绪");
	};

	const handlePagefindError = (error: Error | Event) => {
		console.error("Pagefind 加载错误:", error);
	};

	// 添加事件监听器
	if (window.addEventListener) {
		window.addEventListener("pagefindready", handlePagefindReady);
		window.addEventListener("pagefindloaderror", handlePagefindError);
	}

	// 设置超时以防 pagefind 加载失败
	const timeout = setTimeout(() => {
		console.warn("Pagefind 加载超时");
	}, 10000);

	// 清理函数
	return () => {
		if (window.removeEventListener) {
			window.removeEventListener("pagefindready", handlePagefindReady);
			window.removeEventListener("pagefindloaderror", handlePagefindError);
		}
		if (timeout) {
			clearTimeout(timeout);
		}
	};
});

$: if (initialized && keywordDesktop) {
	(async () => {
		await search(keywordDesktop, true);
	})();
}

$: if (initialized && keywordMobile) {
	(async () => {
		await search(keywordMobile, false);
	})();
}
</script>

<!-- search bar for desktop view -->
<div id="search-bar" class="hidden lg:flex transition-all items-center h-11 mr-2 rounded-lg
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
">
    <iconify-icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></iconify-icon>
    <input placeholder="{i18n(I18nKey.search)}" bind:value={keywordDesktop} on:focus={() => search(keywordDesktop, true)}
           class="transition-all pl-10 text-sm bg-transparent outline-0
         h-full w-40 active:w-60 focus:w-60 text-black/50 dark:text-white/50"
    >
</div>

<!-- toggle btn for phone/tablet view -->
<button on:click={togglePanel} aria-label="Search Panel" id="search-switch"
        class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90">
    <iconify-icon icon="material-symbols:search" class="text-[1.25rem]"></iconify-icon>
</button>

<!-- search panel -->
{#if typeof window !== 'undefined'}
<!-- search panel -->
<div id="search-panel" class="float-panel float-panel-closed search-panel absolute md:w-[30rem]
top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2">

    <!-- search bar inside panel for phone/tablet -->
    <div id="search-bar-inside" class="flex relative lg:hidden transition-all items-center h-11 rounded-xl
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
  ">
        <iconify-icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></iconify-icon>
        <input placeholder="Search" bind:value={keywordMobile}
               class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
               focus:w-60 text-black/50 dark:text-white/50"
        >
    </div>

<!-- search results -->
<div class="search-results">
{#if initialized}
    {#if result && Array.isArray(result) && result.length > 0}
        {#each result as item, index (item.url + index)}
            <a href={item.url}
               class="transition first-of-type:mt-2 lg:first-of-type:mt-0 group block
           rounded-xl text-lg px-3 py-2 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]">
                <div class="transition text-90 inline-flex font-bold group-hover:text-[var(--primary)]">
                    {item.meta?.title || 'Untitled'}<iconify-icon icon="fa6-solid:chevron-right" class="transition text-[0.75rem] translate-x-1 my-auto text-[var(--primary)]"></iconify-icon>
                </div>
                <div class="transition text-sm text-50">
                    {item.excerpt ? item.excerpt.replace(/<[^>]*>/g, '') : ''}
                </div>
            </a>
        {/each}
    {/if}
{/if}
</div>
</div>
{/if}

<style>
  input:focus {
    outline: 0;
  }
  .search-panel {
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
  /* 确保搜索面板使用统一的滚动条样式 */
  .search-panel::-webkit-scrollbar {
    display: none;
  }
  .search-panel {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
</style>
