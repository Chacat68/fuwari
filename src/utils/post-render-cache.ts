import type { CollectionEntry } from "astro:content";

type PostEntry = CollectionEntry<"posts">;
type PostRenderResult = Awaited<ReturnType<PostEntry["render"]>>;

const renderCache = new Map<string, Promise<PostRenderResult>>();

export function renderPostEntry(entry: PostEntry): Promise<PostRenderResult> {
	const key = entry.id || entry.slug;
	const cached = renderCache.get(key);
	if (cached) return cached;

	const promise = entry.render();
	renderCache.set(key, promise);
	return promise;
}
