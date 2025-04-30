/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * Creates a GitHub Card component.
 *
 * @param {Object} properties - The properties of the component.
 * @param {string} properties.repo - The GitHub repository in the format "owner/repo".
 * @param {import('mdast').RootContent[]} children - The children elements of the component.
 * @returns {import('mdast').Parent} The created GitHub Card component.
 */
export function GithubCardComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0)
		return h("div", { class: "hidden" }, [
			'Invalid directive. ("github" directive must be leaf type "::github{repo="owner/repo"}")',
		]);

	if (!properties.repo || !properties.repo.includes("/"))
		return h(
			"div",
			{ class: "hidden" },
			'Invalid repository. ("repo" attributte must be in the format "owner/repo")',
		);

	const repo = properties.repo;
	const cardUuid = `GC${Math.random().toString(36).slice(-6)}`; // Collisions are not important

	const nAvatar = h(`div#${cardUuid}-avatar`, { class: "gc-avatar" });
	const nLanguage = h(
		`span#${cardUuid}-language`,
		{ class: "gc-language" },
		"Waiting...",
	);

	const nTitle = h("div", { class: "gc-titlebar" }, [
		h("div", { class: "gc-titlebar-left" }, [
			h("div", { class: "gc-owner" }, [
				nAvatar,
				h("div", { class: "gc-user" }, repo.split("/")[0]),
			]),
			h("div", { class: "gc-divider" }, "/"),
			h("div", { class: "gc-repo" }, repo.split("/")[1]),
		]),
		h("div", { class: "github-logo" }),
	]);

	const nDescription = h(
		`div#${cardUuid}-description`,
		{ class: "gc-description" },
		"Waiting for api.github.com...",
	);

	const nStars = h(`div#${cardUuid}-stars`, { class: "gc-stars" }, "00K");
	const nForks = h(`div#${cardUuid}-forks`, { class: "gc-forks" }, "0K");
	const nLicense = h(`div#${cardUuid}-license`, { class: "gc-license" }, "0K");

	const nScript = h(
		`script#${cardUuid}-script`,
		{ type: "text/javascript", defer: true },
		`
      // 使用缓存机制加速GitHub卡片渲染
      (function() {
        const repoKey = '${repo}';
        const cacheKey = 'github-card-' + repoKey;
        const cacheTTL = 3600000; // 缓存1小时
        
        // 尝试从缓存获取数据
        function getFromCache() {
          try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
              const data = JSON.parse(cached);
              if (data && data.timestamp && (Date.now() - data.timestamp < cacheTTL)) {
                return data.value;
              }
            }
          } catch (e) {
            console.warn('[GITHUB-CARD] Cache error:', e);
          }
          return null;
        }
        
        // 保存数据到缓存
        function saveToCache(data) {
          try {
            const cacheData = {
              timestamp: Date.now(),
              value: data
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          } catch (e) {
            console.warn('[GITHUB-CARD] Cache save error:', e);
          }
        }
        
        // 更新DOM元素
        function updateUI(data) {
          document.getElementById('${cardUuid}-description').innerText = data.description?.replace(/:[a-zA-Z0-9_]+:/g, '') || "Description not set";
          document.getElementById('${cardUuid}-language').innerText = data.language || "";
          document.getElementById('${cardUuid}-forks').innerText = Intl.NumberFormat('en-us', { notation: "compact", maximumFractionDigits: 1 }).format(data.forks || 0).replaceAll("\u202f", '');
          document.getElementById('${cardUuid}-stars').innerText = Intl.NumberFormat('en-us', { notation: "compact", maximumFractionDigits: 1 }).format(data.stargazers_count || 0).replaceAll("\u202f", '');
          const avatarEl = document.getElementById('${cardUuid}-avatar');
          if (avatarEl && data.owner && data.owner.avatar_url) {
            avatarEl.style.backgroundImage = 'url(' + data.owner.avatar_url + ')';
            avatarEl.style.backgroundColor = 'transparent';
          }
          document.getElementById('${cardUuid}-license').innerText = data.license?.spdx_id || "no-license";
          document.getElementById('${cardUuid}-card').classList.remove("fetch-waiting");
          console.log("[GITHUB-CARD] Loaded card for ${repo} | ${cardUuid}.")
        }
        
        // 主函数
        function init() {
          // 首先尝试从缓存加载
          const cachedData = getFromCache();
          if (cachedData) {
            updateUI(cachedData);
            // 在后台仍然获取最新数据以更新缓存
            fetchData(false);
            return;
          }
          
          // 如果没有缓存，立即获取数据
          fetchData(true);
        }
        
        // 获取数据函数
        function fetchData(updateUIOnSuccess) {
          fetch('https://api.github.com/repos/${repo}', { 
            referrerPolicy: "no-referrer",
            headers: { 'Accept': 'application/vnd.github.v3+json' },
            cache: 'force-cache'
          })
          .then(response => {
            if (!response.ok) throw new Error('GitHub API response not OK');
            return response.json();
          })
          .then(data => {
            // 保存到缓存
            saveToCache(data);
            // 如果需要，更新UI
            if (updateUIOnSuccess) updateUI(data);
          })
          .catch(err => {
            console.warn("[GITHUB-CARD] (Error) Loading card for ${repo} | ${cardUuid}.", err);
            const c = document.getElementById('${cardUuid}-card');
            if (c) c.classList.add("fetch-error");
          });
        }
        
        // 执行初始化
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', init);
        } else {
          init();
        }
      })();
    `,
	);

	return h(
		`a#${cardUuid}-card`,
		{
			class: "card-github fetch-waiting no-styling",
			href: `https://github.com/${repo}`,
			target: "_blank",
			repo,
		},
		[
			nTitle,
			nDescription,
			h("div", { class: "gc-infobar" }, [nStars, nForks, nLicense, nLanguage]),
			nScript,
		],
	);
}
