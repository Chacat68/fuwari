import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import getReadingTime from "reading-time";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTS_DIR = path.join(__dirname, "../src/content/posts");
const OUTPUT_DIR = path.join(__dirname, "../src/data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "blog-stats.json");

/**
 * 递归获取所有 markdown 文件
 */
async function getAllMarkdownFiles(dir, fileList = []) {
	const files = await readdir(dir, { withFileTypes: true });

	for (const file of files) {
		const fullPath = path.join(dir, file.name);
		if (file.isDirectory()) {
			await getAllMarkdownFiles(fullPath, fileList);
		} else if (file.name.endsWith(".md") || file.name.endsWith(".mdx")) {
			fileList.push(fullPath);
		}
	}

	return fileList;
}

/**
 * 解析 frontmatter
 */
function parseFrontmatter(content) {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return { draft: false, content };

	const frontmatterText = match[1];
	const markdownContent = content.slice(match[0].length);

	// 简单解析 draft 字段
	const draftMatch = frontmatterText.match(/draft:\s*(true|false)/);
	const draft = draftMatch ? draftMatch[1] === "true" : false;

	return { draft, content: markdownContent };
}

/**
 * 生成博客统计数据
 */
async function generateStats() {
	console.log("🔍 开始扫描文章...");

	const markdownFiles = await getAllMarkdownFiles(POSTS_DIR);
	console.log(`📝 找到 ${markdownFiles.length} 篇文章`);

	let totalWords = 0;
	let totalMinutes = 0;
	let publishedCount = 0;
	let draftCount = 0;

	for (const filePath of markdownFiles) {
		try {
			const fileContent = await readFile(filePath, "utf-8");
			const { draft, content: markdownContent } = parseFrontmatter(fileContent);

			// 生产环境只统计已发布的文章
			if (process.env.NODE_ENV === "production" && draft) {
				draftCount++;
				continue;
			}

			// 计算字数和阅读时间
			const readingTime = getReadingTime(markdownContent);
			totalWords += readingTime.words;
			totalMinutes += readingTime.minutes;

			if (draft) {
				draftCount++;
			} else {
				publishedCount++;
			}
		} catch (error) {
			console.error(`❌ 处理文件失败: ${filePath}`, error.message);
		}
	}

	const stats = {
		totalPosts: markdownFiles.length,
		publishedPosts: publishedCount,
		draftPosts: draftCount,
		totalWords: Math.round(totalWords),
		totalMinutes: Math.round(totalMinutes),
		averageWords:
			publishedCount > 0 ? Math.round(totalWords / publishedCount) : 0,
		averageMinutes:
			publishedCount > 0 ? Math.round(totalMinutes / publishedCount) : 0,
		lastUpdated: new Date().toISOString(),
	};

	// 确保输出目录存在
	try {
		await mkdir(OUTPUT_DIR, { recursive: true });
	} catch (_) {
		// 目录可能已存在，忽略错误
	}

	// 写入统计数据
	await writeFile(OUTPUT_FILE, JSON.stringify(stats, null, 2), "utf-8");

	console.log("\n✅ 统计完成!");
	console.log(`📊 总文章数: ${stats.totalPosts}`);
	console.log(`📝 已发布: ${stats.publishedPosts}`);
	console.log(`✏️  草稿: ${stats.draftPosts}`);
	console.log(`📈 总字数: ${stats.totalWords.toLocaleString()}`);
	console.log(`⏱️  总阅读时间: ${stats.totalMinutes} 分钟`);
	console.log(`📏 平均字数: ${stats.averageWords.toLocaleString()}`);
	console.log(`🕐 平均阅读时间: ${stats.averageMinutes} 分钟`);
	console.log(`💾 数据已保存至: ${OUTPUT_FILE}\n`);
}

generateStats().catch((error) => {
	console.error("❌ 生成统计数据失败:", error);
	process.exit(1);
});
