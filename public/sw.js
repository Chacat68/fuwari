// Service Worker 缓存策略
const _CACHE_NAME = "chawfoo-v1.0.0";
const STATIC_CACHE = "static-v1.0.0";
const DYNAMIC_CACHE = "dynamic-v1.0.0";

// 需要缓存的静态资源
const STATIC_ASSETS = [
	"/",
	"/about/",
	"/archive/",
	"/projects/",
	"/friends/",
	"/manifest.json",
	"/favicon/favicon-light-180.png",
	"/pagefind/pagefind.js",
];

// 需要缓存的动态资源模式
const _DYNAMIC_PATTERNS = [
	/^\/posts\/.*/,
	/^\/_astro\/.*\.(js|css)$/,
	/^\/logo\/.*\.(png|jpg|jpeg|webp)$/,
];

// 安装事件
self.addEventListener("install", (event) => {
	console.log("Service Worker installing...");

	event.waitUntil(
		caches
			.open(STATIC_CACHE)
			.then((cache) => {
				console.log("Caching static assets...");
				return cache.addAll(STATIC_ASSETS);
			})
			.then(() => {
				console.log("Static assets cached successfully");
				return self.skipWaiting();
			})
			.catch((error) => {
				console.error("Failed to cache static assets:", error);
			}),
	);
});

// 激活事件
self.addEventListener("activate", (event) => {
	console.log("Service Worker activating...");

	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						// 删除旧版本缓存
						if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
							console.log("Deleting old cache:", cacheName);
							return caches.delete(cacheName);
						}
					}),
				);
			})
			.then(() => {
				console.log("Service Worker activated");
				return self.clients.claim();
			}),
	);
});

// 获取事件 - 缓存策略
self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// 只处理同源请求
	if (url.origin !== location.origin) {
		return;
	}

	// 跳过非GET请求
	if (request.method !== "GET") {
		return;
	}

	// 跳过Pagefind搜索请求
	if (url.pathname.includes("/pagefind/") && url.search) {
		return;
	}

	event.respondWith(handleRequest(request));
});

// 请求处理函数
async function handleRequest(request) {
	const url = new URL(request.url);

	try {
		// 1. 静态资源缓存优先策略
		if (isStaticAsset(url.pathname)) {
			return await cacheFirst(request, STATIC_CACHE);
		}

		// 2. 动态资源网络优先策略
		if (isDynamicAsset(url.pathname)) {
			return await networkFirst(request, DYNAMIC_CACHE);
		}

		// 3. 页面资源混合策略
		if (isPageResource(url.pathname)) {
			return await staleWhileRevalidate(request, DYNAMIC_CACHE);
		}

		// 4. 默认网络优先
		return await networkFirst(request, DYNAMIC_CACHE);
	} catch (error) {
		console.error("Request handling failed:", error);

		// 降级到缓存或离线页面
		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}

		// 如果是页面请求，返回离线页面
		if (request.headers.get("accept")?.includes("text/html")) {
			return (
				caches.match("/offline.html") ||
				new Response("Offline", { status: 503 })
			);
		}

		throw error;
	}
}

// 缓存优先策略
async function cacheFirst(request, cacheName) {
	const cachedResponse = await caches.match(request);
	if (cachedResponse) {
		return cachedResponse;
	}

	const networkResponse = await fetch(request);
	if (networkResponse.ok) {
		const cache = await caches.open(cacheName);
		cache.put(request, networkResponse.clone());
	}

	return networkResponse;
}

// 网络优先策略
async function networkFirst(request, cacheName) {
	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			const cache = await caches.open(cacheName);
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) {
		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}
		throw error;
	}
}

// 陈旧重新验证策略
async function staleWhileRevalidate(request, cacheName) {
	const cachedResponse = await caches.match(request);

	// 后台更新缓存
	const fetchPromise = fetch(request)
		.then((networkResponse) => {
			if (networkResponse.ok) {
				const cache = caches.open(cacheName);
				cache.then((c) => c.put(request, networkResponse.clone()));
			}
			return networkResponse;
		})
		.catch(() => {
			// 网络失败时返回缓存
			return cachedResponse;
		});

	// 立即返回缓存（如果存在），否则等待网络响应
	return cachedResponse || fetchPromise;
}

// 判断是否为静态资源
function isStaticAsset(pathname) {
	const staticPatterns = [
		/^\/_astro\/.*\.(js|css)$/,
		/^\/favicon\//,
		/^\/logo\//,
		/^\/manifest\.json$/,
		/^\/robots\.txt$/,
		/^\/sitemap.*\.xml$/,
	];

	return staticPatterns.some((pattern) => pattern.test(pathname));
}

// 判断是否为动态资源
function isDynamicAsset(pathname) {
	const dynamicPatterns = [/^\/posts\/.*/, /^\/archive\/.*/, /^\/projects\/.*/];

	return dynamicPatterns.some((pattern) => pattern.test(pathname));
}

// 判断是否为页面资源
function isPageResource(pathname) {
	return pathname.endsWith("/") || pathname === "" || pathname === "/";
}

// 消息处理
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}

	if (event.data && event.data.type === "CLEAR_CACHE") {
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => caches.delete(cacheName)),
				);
			})
			.then(() => {
				event.ports[0].postMessage({ success: true });
			});
	}
});

// 定期清理过期缓存
self.addEventListener("sync", (event) => {
	if (event.tag === "cleanup-cache") {
		event.waitUntil(cleanupCache());
	}
});

async function cleanupCache() {
	const cacheNames = await caches.keys();
	const now = Date.now();
	const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天

	for (const cacheName of cacheNames) {
		if (cacheName.startsWith("dynamic-")) {
			const cache = await caches.open(cacheName);
			const requests = await cache.keys();

			for (const request of requests) {
				const response = await cache.match(request);
				if (response) {
					const dateHeader = response.headers.get("date");
					if (dateHeader) {
						const responseDate = new Date(dateHeader).getTime();
						if (now - responseDate > maxAge) {
							await cache.delete(request);
						}
					}
				}
			}
		}
	}
}

console.log("Service Worker loaded successfully");
