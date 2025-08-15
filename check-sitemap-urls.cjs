#!/usr/bin/env node

/**
 * Sitemap URL 检查工具
 * 检查 sitemap 中的所有 URL 是否有效
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { parseString } = require("xml2js");

// 配置
const SITEMAP_PATH = "./dist/sitemap-0.xml";
const TIMEOUT = 10000; // 10秒超时
const MAX_CONCURRENT = 5; // 最大并发请求数

// 结果统计
const results = {
	total: 0,
	valid: 0,
	invalid: 0,
	timeout: 0,
	errors: [],
};

/**
 * 检查单个 URL 的有效性
 * @param {string} url - 要检查的 URL
 * @returns {Promise<Object>} 检查结果
 */
function checkUrl(url) {
	return new Promise((resolve) => {
		const urlObj = new URL(url);
		const isHttps = urlObj.protocol === "https:";
		const client = isHttps ? https : http;

		const options = {
			hostname: urlObj.hostname,
			port: urlObj.port || (isHttps ? 443 : 80),
			path: urlObj.pathname + urlObj.search,
			method: "HEAD", // 使用 HEAD 请求减少数据传输
			timeout: TIMEOUT,
			headers: {
				"User-Agent": "Mozilla/5.0 (compatible; SitemapChecker/1.0)",
			},
		};

		const req = client.request(options, (res) => {
			const statusCode = res.statusCode;
			const isValid = statusCode >= 200 && statusCode < 400;

			resolve({
				url,
				statusCode,
				isValid,
				error: null,
				isTimeout: false,
			});
		});

		req.on("error", (error) => {
			resolve({
				url,
				statusCode: null,
				isValid: false,
				error: error.message,
				isTimeout: false,
			});
		});

		req.on("timeout", () => {
			req.destroy();
			resolve({
				url,
				statusCode: null,
				isValid: false,
				error: "Request timeout",
				isTimeout: true,
			});
		});

		req.setTimeout(TIMEOUT);
		req.end();
	});
}

/**
 * 并发检查多个 URL
 * @param {Array<string>} urls - URL 列表
 * @param {number} concurrency - 并发数
 * @returns {Promise<Array>} 检查结果列表
 */
async function checkUrlsConcurrently(urls, concurrency = MAX_CONCURRENT) {
	const results = [];

	for (let i = 0; i < urls.length; i += concurrency) {
		const batch = urls.slice(i, i + concurrency);
		const batchPromises = batch.map((url) => checkUrl(url));
		const batchResults = await Promise.all(batchPromises);
		results.push(...batchResults);

		// 显示进度
		console.log(
			`已检查 ${Math.min(i + concurrency, urls.length)}/${urls.length} 个 URL`,
		);

		// 避免请求过于频繁
		if (i + concurrency < urls.length) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	return results;
}

/**
 * 从 sitemap XML 中提取 URL
 * @param {string} xmlContent - XML 内容
 * @returns {Promise<Array<string>>} URL 列表
 */
function extractUrlsFromSitemap(xmlContent) {
	return new Promise((resolve, reject) => {
		parseString(xmlContent, (err, result) => {
			if (err) {
				reject(err);
				return;
			}

			try {
				const urls = result.urlset.url.map((urlEntry) => urlEntry.loc[0]);
				resolve(urls);
			} catch (error) {
				reject(new Error("无法解析 sitemap 结构"));
			}
		});
	});
}

/**
 * 生成检查报告
 * @param {Array} checkResults - 检查结果
 */
function generateReport(checkResults) {
	console.log("\n=== Sitemap URL 检查报告 ===\n");

	// 统计结果
	results.total = checkResults.length;
	results.valid = checkResults.filter((r) => r.isValid).length;
	results.invalid = checkResults.filter((r) => !r.isValid).length;
	results.timeout = checkResults.filter((r) => r.isTimeout).length;

	console.log(`总计 URL: ${results.total}`);
	console.log(`有效 URL: ${results.valid}`);
	console.log(`无效 URL: ${results.invalid}`);
	console.log(`超时 URL: ${results.timeout}`);
	console.log(
		`成功率: ${((results.valid / results.total) * 100).toFixed(2)}%\n`,
	);

	// 显示无效 URL 详情
	const invalidUrls = checkResults.filter((r) => !r.isValid);
	if (invalidUrls.length > 0) {
		console.log("=== 无效 URL 详情 ===\n");
		invalidUrls.forEach((result) => {
			console.log(`❌ ${result.url}`);
			console.log(`   状态码: ${result.statusCode || "N/A"}`);
			console.log(`   错误: ${result.error || "未知错误"}`);
			if (result.isTimeout) {
				console.log("   类型: 请求超时");
			}
			console.log("");

			results.errors.push({
				url: result.url,
				statusCode: result.statusCode,
				error: result.error,
				isTimeout: result.isTimeout,
			});
		});
	}

	// 按状态码分组显示
	const statusGroups = {};
	checkResults.forEach((result) => {
		if (result.statusCode) {
			const statusRange = Math.floor(result.statusCode / 100) * 100;
			const key = statusRange + "-" + (statusRange + 99);
			if (!statusGroups[key]) {
				statusGroups[key] = [];
			}
			statusGroups[key].push(result);
		}
	});

	console.log("=== 状态码分布 ===\n");
	Object.keys(statusGroups)
		.sort()
		.forEach((range) => {
			console.log(`${range}: ${statusGroups[range].length} 个 URL`);
		});

	// 保存详细报告到文件
	const reportData = {
		timestamp: new Date().toISOString(),
		summary: results,
		details: checkResults,
	};

	fs.writeFileSync(
		"./sitemap-check-report.json",
		JSON.stringify(reportData, null, 2),
	);
	console.log("\n详细报告已保存到: sitemap-check-report.json");
}

/**
 * 主函数
 */
async function main() {
	try {
		console.log("开始检查 sitemap 中的 URL...");

		// 检查 sitemap 文件是否存在
		if (!fs.existsSync(SITEMAP_PATH)) {
			console.error(`错误: 找不到 sitemap 文件: ${SITEMAP_PATH}`);
			console.log("请先运行 npm run build 生成 sitemap");
			process.exit(1);
		}

		// 读取并解析 sitemap
		const xmlContent = fs.readFileSync(SITEMAP_PATH, "utf8");
		const urls = await extractUrlsFromSitemap(xmlContent);

		console.log(`从 sitemap 中找到 ${urls.length} 个 URL`);
		console.log("开始检查 URL 有效性...\n");

		// 检查所有 URL
		const checkResults = await checkUrlsConcurrently(urls);

		// 生成报告
		generateReport(checkResults);
	} catch (error) {
		console.error("检查过程中发生错误:", error.message);
		process.exit(1);
	}
}

// 运行主函数
if (require.main === module) {
	main();
}

module.exports = { checkUrl, checkUrlsConcurrently, extractUrlsFromSitemap };
