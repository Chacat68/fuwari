// Service Worker for Fuwari Blog
// 提供离线支持、缓存优化和性能提升

const CACHE_NAME = "fuwari-blog-v1.0.1";
const STATIC_CACHE_NAME = "fuwari-static-v1.0.1";
const DYNAMIC_CACHE_NAME = "fuwari-dynamic-v1.0.1";

// 需要缓存的静态资源
const STATIC_ASSETS = [
	"/",
	"/about/",
	"/archive/",
	"/projects/",
	"/friends/",
	"/manifest.json",
	// 添加关键CSS和JS文件
];

// 需要缓存的动态内容模式
const CACHE_PATTERNS = [
	/\/posts\/.*/,
	/\/api\/.*/,
	/\.(css|js|woff2?|png|jpg|jpeg|webp|svg)$/,
];

// 安装事件 - 预缓存静态资源
self.addEventListener("install", (event) => {
	console.log("[SW] 安装中...");

	event.waitUntil(
		caches
			.open(STATIC_CACHE_NAME)
			.then((cache) => {
				console.log("[SW] 预缓存静态资源");
				// 使用更安全的缓存策略，逐个添加资源
				return Promise.allSettled(
					STATIC_ASSETS.map((url) =>
						cache.add(url).catch((error) => {
							console.warn(`[SW] 无法缓存资源 ${url}:`, error);
							return null; // 继续处理其他资源
						}),
					),
				);
			})
			.then(() => {
				console.log("[SW] 安装完成");
				return self.skipWaiting();
			})
			.catch((error) => {
				console.error("[SW] 安装失败:", error);
				// 即使部分资源缓存失败，也继续安装
				return self.skipWaiting();
			}),
	);
});

// 激活事件 - 清理旧缓存
self.addEventListener("activate", (event) => {
	console.log("[SW] 激活中...");

	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (
							cacheName !== STATIC_CACHE_NAME &&
							cacheName !== DYNAMIC_CACHE_NAME &&
							cacheName !== CACHE_NAME
						) {
							console.log("[SW] 删除旧缓存:", cacheName);
							return caches.delete(cacheName);
						}
					}),
				);
			})
			.then(() => {
				console.log("[SW] 激活完成");
				return self.clients.claim();
			}),
	);
});

// 拦截网络请求
self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// 只处理同源请求
	if (url.origin !== location.origin) {
		return;
	}

	// 处理导航请求（页面请求）
	if (request.mode === "navigate") {
		event.respondWith(handleNavigationRequest(request));
		return;
	}

	// 处理静态资源请求
	if (isStaticAsset(request.url)) {
		event.respondWith(handleStaticAssetRequest(request));
		return;
	}

	// 处理API请求
	if (request.url.includes("/api/")) {
		event.respondWith(handleApiRequest(request));
		return;
	}

	// 处理其他请求
	event.respondWith(handleOtherRequest(request));
});

// 处理导航请求（页面请求）
async function handleNavigationRequest(request) {
	try {
		// 尝试从网络获取
		const networkResponse = await fetch(request);

		// 如果成功，缓存响应并返回
		if (networkResponse.ok) {
			const cache = await caches.open(DYNAMIC_CACHE_NAME);
			cache.put(request, networkResponse.clone());
			return networkResponse;
		}

		// 如果响应不成功（如503），记录错误但不抛出异常
		console.warn("[SW] 网络响应不成功:", networkResponse.status, request.url);
	} catch (error) {
		console.log("[SW] 网络请求失败，尝试从缓存获取:", error);
	}

	// 网络失败或响应不成功，尝试从缓存获取
	const cachedResponse = await caches.match(request);
	if (cachedResponse) {
		return cachedResponse;
	}

	// 缓存也没有，返回离线页面
	return caches.match("/");
}

// 处理静态资源请求
async function handleStaticAssetRequest(request) {
	// 缓存优先策略
	const cachedResponse = await caches.match(request);
	if (cachedResponse) {
		return cachedResponse;
	}

	try {
		const networkResponse = await fetch(request);
		// 只对GET请求进行缓存，HEAD请求不支持缓存
		if (networkResponse.ok && request.method === "GET") {
			const cache = await caches.open(STATIC_CACHE_NAME);
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) {
		console.error("[SW] 静态资源请求失败:", error);
		throw error;
	}
}

// 处理API请求
async function handleApiRequest(request) {
	try {
		// API请求优先使用网络
		const networkResponse = await fetch(request);

		if (networkResponse.ok) {
			// 缓存GET请求的响应
			if (request.method === "GET") {
				const cache = await caches.open(DYNAMIC_CACHE_NAME);
				cache.put(request, networkResponse.clone());
			}
		}

		return networkResponse;
	} catch (error) {
		// 网络失败时，尝试从缓存获取GET请求
		if (request.method === "GET") {
			const cachedResponse = await caches.match(request);
			if (cachedResponse) {
				return cachedResponse;
			}
		}

		throw error;
	}
}

// 处理其他请求
async function handleOtherRequest(request) {
	try {
		const networkResponse = await fetch(request);

		// 只缓存成功的响应（200-299状态码）
		if (networkResponse.ok && shouldCache(request)) {
			const cache = await caches.open(DYNAMIC_CACHE_NAME);
			cache.put(request, networkResponse.clone());
		} else if (!networkResponse.ok) {
			console.warn(
				"[SW] 响应不成功，不缓存:",
				networkResponse.status,
				request.url,
			);
		}

		return networkResponse;
	} catch (error) {
		console.log("[SW] 其他请求失败，尝试从缓存获取:", error);
		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}

		throw error;
	}
}

// 判断是否为静态资源
function isStaticAsset(url) {
	return /\.(css|js|woff2?|png|jpg|jpeg|webp|svg|ico)$/.test(url);
}

// 判断是否应该缓存
function shouldCache(request) {
	const url = request.url;

	// 不缓存POST请求
	if (request.method !== "GET") {
		return false;
	}

	// 检查是否匹配缓存模式
	return CACHE_PATTERNS.some((pattern) => pattern.test(url));
}

// 后台同步（如果支持）
if ("sync" in self.registration) {
	self.addEventListener("sync", (event) => {
		console.log("[SW] 后台同步:", event.tag);

		if (event.tag === "background-sync") {
			event.waitUntil(doBackgroundSync());
		}
	});
}

// 执行后台同步
async function doBackgroundSync() {
	try {
		// 这里可以执行一些后台任务
		// 比如同步离线时的操作、更新缓存等
		console.log("[SW] 执行后台同步任务");
	} catch (error) {
		console.error("[SW] 后台同步失败:", error);
	}
}

// 推送通知（如果需要）
self.addEventListener("push", (event) => {
	if (event.data) {
		const data = event.data.json();
		const options = {
			body: data.body,
			icon: "/favicon/favicon-light-192.png",
			badge: "/favicon/favicon-light-32.png",
			vibrate: [100, 50, 100],
			data: {
				dateOfArrival: Date.now(),
				primaryKey: data.primaryKey,
			},
			actions: [
				{
					action: "explore",
					title: "查看详情",
					icon: "/favicon/favicon-light-32.png",
				},
				{
					action: "close",
					title: "关闭",
					icon: "/favicon/favicon-light-32.png",
				},
			],
		};

		event.waitUntil(self.registration.showNotification(data.title, options));
	}
});

// 通知点击处理
self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	if (event.action === "explore") {
		event.waitUntil(clients.openWindow("/"));
	}
});

// 错误处理
self.addEventListener("error", (event) => {
	console.error("[SW] Service Worker错误:", event.error);
});

self.addEventListener("unhandledrejection", (event) => {
	console.error("[SW] 未处理的Promise拒绝:", event.reason);
});

console.log("[SW] Service Worker已加载");
