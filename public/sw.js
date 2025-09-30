// Service Worker for Fuwari Blog
// 提供离线支持、缓存优化和性能提升

const CACHE_NAME = "fuwari-blog-v1.0.2";
const STATIC_CACHE_NAME = "fuwari-static-v1.0.2";
const DYNAMIC_CACHE_NAME = "fuwari-dynamic-v1.0.2";

// 请求去重映射，避免并发请求
const pendingRequests = new Map();

// 需要缓存的静态资源 - 只缓存关键资源
const STATIC_ASSETS = [
	"/",
	"/manifest.json",
	// 移除其他页面的预缓存，减少首次加载时间
];

// 需要缓存的动态内容模式 - 优化缓存策略
const CACHE_PATTERNS = [
	/\/api\/.*/,
	/\.(css|js|woff2?|png|jpg|jpeg|webp|svg)$/,
	// 移除 /posts/.* 模式，避免缓存过多文章页面
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

	// 处理其他请求，使用去重机制
	event.respondWith(handleRequestWithDeduplication(request));
});

// 处理导航请求（页面请求）- 优化为网络优先策略
async function handleNavigationRequest(request) {
	try {
		// 优先从网络获取最新内容
		const networkResponse = await fetch(request, {
			// 添加超时控制
			signal: AbortSignal.timeout(5000), // 5秒超时
		});

		// 如果成功，缓存响应并返回
		if (networkResponse.ok) {
			// 只缓存首页，其他页面不缓存以减少内存占用
			if (request.url.endsWith("/") || request.url.endsWith("/index.html")) {
				try {
					const cache = await caches.open(DYNAMIC_CACHE_NAME);
					// 确保在缓存之前克隆响应，避免body被锁定
					const responseClone = networkResponse.clone();
					await cache.put(request, responseClone);
					console.log("[SW] 成功缓存导航请求:", request.url);
				} catch (cacheError) {
					console.warn("[SW] 缓存导航请求失败:", cacheError, request.url);
					// 缓存失败不应该影响响应返回
				}
			}
			return networkResponse;
		}

		// 如果响应不成功（如503），记录错误但不抛出异常
		console.warn("[SW] 网络响应不成功:", networkResponse.status, request.url);
	} catch (error) {
		console.log("[SW] 网络请求失败，尝试从缓存获取:", error);
	}

	// 网络失败或响应不成功，尝试从缓存获取
	try {
		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			console.log("[SW] 使用缓存的导航请求:", request.url);
			return cachedResponse;
		}
	} catch (cacheError) {
		console.warn("[SW] 获取缓存失败:", cacheError, request.url);
	}

	// 缓存也没有，返回离线页面
	try {
		const offlineResponse = await caches.match("/");
		if (offlineResponse) {
			console.log("[SW] 返回离线页面:", request.url);
			return offlineResponse;
		}
	} catch (offlineError) {
		console.warn("[SW] 获取离线页面失败:", offlineError);
	}

	// 最后的兜底方案
	console.error("[SW] 无法处理导航请求:", request.url);
	throw new Error("Service Worker无法处理请求");
}

// 处理静态资源请求
async function handleStaticAssetRequest(request) {
	// 缓存优先策略
	try {
		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}
	} catch (cacheError) {
		console.warn("[SW] 获取静态资源缓存失败:", cacheError, request.url);
	}

	try {
		const networkResponse = await fetch(request);
		// 只对GET请求进行缓存，HEAD请求不支持缓存
		if (networkResponse.ok && request.method === "GET") {
			try {
				const cache = await caches.open(STATIC_CACHE_NAME);
				await cache.put(request, networkResponse.clone());
				console.log("[SW] 成功缓存静态资源:", request.url);
			} catch (cacheError) {
				console.warn("[SW] 缓存静态资源失败:", cacheError, request.url);
				// 缓存失败不应该影响响应返回
			}
		}
		return networkResponse;
	} catch (error) {
		console.error("[SW] 静态资源请求失败:", error, request.url);
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
				try {
					const cache = await caches.open(DYNAMIC_CACHE_NAME);
					await cache.put(request, networkResponse.clone());
					console.log("[SW] 成功缓存API请求:", request.url);
				} catch (cacheError) {
					console.warn("[SW] 缓存API请求失败:", cacheError, request.url);
					// 缓存失败不应该影响响应返回
				}
			}
		}

		return networkResponse;
	} catch (error) {
		console.error("[SW] API请求失败:", error, request.url);
		// 网络失败时，尝试从缓存获取GET请求
		if (request.method === "GET") {
			try {
				const cachedResponse = await caches.match(request);
				if (cachedResponse) {
					console.log("[SW] 使用缓存的API请求:", request.url);
					return cachedResponse;
				}
			} catch (cacheError) {
				console.warn("[SW] 获取API缓存失败:", cacheError, request.url);
			}
		}

		throw error;
	}
}

// 请求去重处理
async function handleRequestWithDeduplication(request) {
	const requestKey = request.url + request.method;

	// 如果相同的请求正在进行中，等待它完成
	if (pendingRequests.has(requestKey)) {
		console.log("[SW] 请求去重，等待进行中的请求:", request.url);
		const originalResponse = await pendingRequests.get(requestKey);
		// 克隆响应以避免body被锁定
		return originalResponse.clone();
	}

	// 创建新的请求处理
	const requestPromise = handleOtherRequest(request);
	pendingRequests.set(requestKey, requestPromise);

	try {
		const response = await requestPromise;
		return response;
	} finally {
		// 清理完成的请求
		pendingRequests.delete(requestKey);
	}
}

// 处理其他请求
async function handleOtherRequest(request) {
	try {
		// 添加重试机制和更好的错误处理
		const networkResponse = await fetch(request, {
			// 添加超时和重试机制
			signal: AbortSignal.timeout(10000), // 10秒超时
		});

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

			// 对于503错误，尝试从缓存获取
			if (networkResponse.status === 503) {
				const cachedResponse = await caches.match(request);
				if (cachedResponse) {
					console.log("[SW] 503错误，使用缓存内容:", request.url);
					return cachedResponse;
				}
			}
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

	// 不缓存可能返回503的查询参数请求
	if (url.includes("?category=") || url.includes("?tag=")) {
		console.log("[SW] 跳过缓存查询参数请求:", url);
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
