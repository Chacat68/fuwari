#!/usr/bin/env node

/**
 * Sitemap 问题分析工具
 * 基于用户提供的分析结果，检查特定的问题 URL
 */

const fs = require('node:fs');
const https = require('node:https');
const http = require('node:http');
const { parseString } = require('xml2js');

// 配置
const SITEMAP_PATH = './dist/sitemap-0.xml';
const TIMEOUT = 15000; // 15秒超时，用于检测慢页面
const REPORT_FILE = './sitemap-issues-analysis.json';

/**
 * 详细检查单个 URL
 * @param {string} url - 要检查的 URL
 * @returns {Promise<Object>} 详细检查结果
 */
function detailedUrlCheck(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET', // 使用 GET 请求获取完整响应
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SitemapAnalyzer/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate'
      }
    };

    const req = client.request(options, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      let data = '';
      let contentLength = 0;
      
      res.on('data', (chunk) => {
        data += chunk;
        contentLength += chunk.length;
      });
      
      res.on('end', () => {
        const result = {
          url,
          statusCode: res.statusCode,
          responseTime,
          contentLength,
          headers: res.headers,
          isValid: res.statusCode >= 200 && res.statusCode < 400,
          isRedirect: res.statusCode >= 300 && res.statusCode < 400,
          isSlow: responseTime > 3000, // 超过3秒认为是慢页面
          isLargeHtml: contentLength > 100000, // 超过100KB认为是大文件
          hasMetaDescription: false,
          metaDescriptionLength: 0,
          title: '',
          error: null,
          isTimeout: false
        };
        
        // 分析 HTML 内容（仅对成功的 HTML 响应）
        if (result.isValid && res.headers['content-type'] && 
            res.headers['content-type'].includes('text/html')) {
          
          // 提取标题
          const titleMatch = data.match(/<title[^>]*>([^<]*)<\/title>/i);
          if (titleMatch) {
            result.title = titleMatch[1].trim();
          }
          
          // 检查 meta description
          const metaDescMatch = data.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
          if (metaDescMatch) {
            result.hasMetaDescription = true;
            result.metaDescriptionLength = metaDescMatch[1].length;
          }
        }
        
        resolve(result);
      });
    });

    req.on('error', (error) => {
      const endTime = Date.now();
      resolve({
        url,
        statusCode: null,
        responseTime: endTime - startTime,
        contentLength: 0,
        headers: {},
        isValid: false,
        isRedirect: false,
        isSlow: false,
        isLargeHtml: false,
        hasMetaDescription: false,
        metaDescriptionLength: 0,
        title: '',
        error: error.message,
        isTimeout: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        statusCode: null,
        responseTime: TIMEOUT,
        contentLength: 0,
        headers: {},
        isValid: false,
        isRedirect: false,
        isSlow: true,
        isLargeHtml: false,
        hasMetaDescription: false,
        metaDescriptionLength: 0,
        title: '',
        error: 'Request timeout',
        isTimeout: true
      });
    });

    req.setTimeout(TIMEOUT);
    req.end();
  });
}

/**
 * 从 sitemap XML 中提取 URL
 */
function extractUrlsFromSitemap(xmlContent) {
  return new Promise((resolve, reject) => {
    parseString(xmlContent, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        const urls = result.urlset.url.map(urlEntry => urlEntry.loc[0]);
        resolve(urls);
      } catch {
        reject(new Error('无法解析 sitemap 结构'));
      }
    });
  });
}

/**
 * 分析检查结果并生成问题报告
 */
function analyzeResults(results) {
  const analysis = {
    timestamp: new Date().toISOString(),
    totalUrls: results.length,
    issues: {
      invalidUrls: [],
      slowPages: [],
      largeHtmlFiles: [],
      missingMetaDescription: [],
      shortMetaDescription: [],
      timeoutUrls: [],
      redirectUrls: []
    },
    statistics: {
      averageResponseTime: 0,
      averageContentLength: 0,
      statusCodeDistribution: {},
      contentTypeDistribution: {}
    }
  };
  
  let totalResponseTime = 0;
  let totalContentLength = 0;
  let validResults = 0;
  
  results.forEach(result => {
    // 统计响应时间和内容长度
    if (result.isValid) {
      totalResponseTime += result.responseTime;
      totalContentLength += result.contentLength;
      validResults++;
    }
    
    // 状态码分布
    const statusCode = result.statusCode || 'Error';
    analysis.statistics.statusCodeDistribution[statusCode] = 
      (analysis.statistics.statusCodeDistribution[statusCode] || 0) + 1;
    
    // 内容类型分布
    const contentType = result.headers['content-type'] || 'Unknown';
    const mainContentType = contentType.split(';')[0];
    analysis.statistics.contentTypeDistribution[mainContentType] = 
      (analysis.statistics.contentTypeDistribution[mainContentType] || 0) + 1;
    
    // 收集各种问题
    if (!result.isValid) {
      analysis.issues.invalidUrls.push({
        url: result.url,
        statusCode: result.statusCode,
        error: result.error,
        responseTime: result.responseTime
      });
    }
    
    if (result.isSlow) {
      analysis.issues.slowPages.push({
        url: result.url,
        responseTime: result.responseTime,
        statusCode: result.statusCode
      });
    }
    
    if (result.isLargeHtml) {
      analysis.issues.largeHtmlFiles.push({
        url: result.url,
        contentLength: result.contentLength,
        responseTime: result.responseTime
      });
    }
    
    if (result.isValid && !result.hasMetaDescription) {
      analysis.issues.missingMetaDescription.push({
        url: result.url,
        title: result.title
      });
    }
    
    if (result.hasMetaDescription && result.metaDescriptionLength < 120) {
      analysis.issues.shortMetaDescription.push({
        url: result.url,
        metaDescriptionLength: result.metaDescriptionLength,
        title: result.title
      });
    }
    
    if (result.isTimeout) {
      analysis.issues.timeoutUrls.push({
        url: result.url,
        error: result.error
      });
    }
    
    if (result.isRedirect) {
      analysis.issues.redirectUrls.push({
        url: result.url,
        statusCode: result.statusCode,
        location: result.headers.location || 'Unknown'
      });
    }
  });
  
  // 计算平均值
  if (validResults > 0) {
    analysis.statistics.averageResponseTime = Math.round(totalResponseTime / validResults);
    analysis.statistics.averageContentLength = Math.round(totalContentLength / validResults);
  }
  
  return analysis;
}

/**
 * 生成详细报告
 */
function generateDetailedReport(analysis) {
  console.log('\n=== Sitemap 详细问题分析报告 ===\n');
  
  console.log(`检查时间: ${analysis.timestamp}`);
  console.log(`总 URL 数: ${analysis.totalUrls}\n`);
  
  // 性能统计
  console.log('=== 性能统计 ===');
  console.log(`平均响应时间: ${analysis.statistics.averageResponseTime}ms`);
  console.log(`平均内容大小: ${(analysis.statistics.averageContentLength / 1024).toFixed(2)}KB\n`);
  
  // 状态码分布
  console.log('=== 状态码分布 ===');
  Object.entries(analysis.statistics.statusCodeDistribution)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([code, count]) => {
      console.log(`${code}: ${count} 个`);
    });
  console.log('');
  
  // 问题详情
  const issues = analysis.issues;
  
  if (issues.invalidUrls.length > 0) {
    console.log(`=== 无效 URL (${issues.invalidUrls.length} 个) ===`);
    issues.invalidUrls.forEach(item => {
      console.log(`❌ ${item.url}`);
      console.log(`   状态码: ${item.statusCode || 'N/A'}`);
      console.log(`   错误: ${item.error || '未知'}`);
      console.log(`   响应时间: ${item.responseTime}ms\n`);
    });
  }
  
  if (issues.timeoutUrls.length > 0) {
    console.log(`=== 超时 URL (${issues.timeoutUrls.length} 个) ===`);
    issues.timeoutUrls.forEach(item => {
      console.log(`⏰ ${item.url}`);
      console.log(`   错误: ${item.error}\n`);
    });
  }
  
  if (issues.slowPages.length > 0) {
    console.log(`=== 慢页面 (${issues.slowPages.length} 个) ===`);
    issues.slowPages.slice(0, 10).forEach(item => {
      console.log(`🐌 ${item.url}`);
      console.log(`   响应时间: ${item.responseTime}ms`);
      console.log(`   状态码: ${item.statusCode}\n`);
    });
    if (issues.slowPages.length > 10) {
      console.log(`   ... 还有 ${issues.slowPages.length - 10} 个慢页面\n`);
    }
  }
  
  if (issues.largeHtmlFiles.length > 0) {
    console.log(`=== 大 HTML 文件 (${issues.largeHtmlFiles.length} 个) ===`);
    issues.largeHtmlFiles.slice(0, 10).forEach(item => {
      console.log(`📄 ${item.url}`);
      console.log(`   文件大小: ${(item.contentLength / 1024).toFixed(2)}KB`);
      console.log(`   响应时间: ${item.responseTime}ms\n`);
    });
    if (issues.largeHtmlFiles.length > 10) {
      console.log(`   ... 还有 ${issues.largeHtmlFiles.length - 10} 个大文件\n`);
    }
  }
  
  if (issues.missingMetaDescription.length > 0) {
    console.log(`=== 缺少 Meta Description (${issues.missingMetaDescription.length} 个) ===`);
    issues.missingMetaDescription.slice(0, 10).forEach(item => {
      console.log(`📝 ${item.url}`);
      console.log(`   标题: ${item.title || '无标题'}\n`);
    });
    if (issues.missingMetaDescription.length > 10) {
      console.log(`   ... 还有 ${issues.missingMetaDescription.length - 10} 个页面\n`);
    }
  }
  
  if (issues.shortMetaDescription.length > 0) {
    console.log(`=== Meta Description 过短 (${issues.shortMetaDescription.length} 个) ===`);
    issues.shortMetaDescription.slice(0, 10).forEach(item => {
      console.log(`📏 ${item.url}`);
      console.log(`   描述长度: ${item.metaDescriptionLength} 字符`);
      console.log(`   标题: ${item.title || '无标题'}\n`);
    });
    if (issues.shortMetaDescription.length > 10) {
      console.log(`   ... 还有 ${issues.shortMetaDescription.length - 10} 个页面\n`);
    }
  }
  
  if (issues.redirectUrls.length > 0) {
    console.log(`=== 重定向 URL (${issues.redirectUrls.length} 个) ===`);
    issues.redirectUrls.forEach(item => {
      console.log(`🔄 ${item.url}`);
      console.log(`   状态码: ${item.statusCode}`);
      console.log(`   重定向到: ${item.location}\n`);
    });
  }
  
  // 总结建议
  console.log('=== 优化建议 ===');
  if (issues.slowPages.length > 0) {
    console.log(`• 有 ${issues.slowPages.length} 个页面响应较慢，建议优化页面加载速度`);
  }
  if (issues.largeHtmlFiles.length > 0) {
    console.log(`• 有 ${issues.largeHtmlFiles.length} 个 HTML 文件较大，建议压缩或优化内容`);
  }
  if (issues.missingMetaDescription.length > 0) {
    console.log(`• 有 ${issues.missingMetaDescription.length} 个页面缺少 Meta Description，影响 SEO`);
  }
  if (issues.shortMetaDescription.length > 0) {
    console.log(`• 有 ${issues.shortMetaDescription.length} 个页面的 Meta Description 过短，建议扩展到 120-160 字符`);
  }
  if (issues.invalidUrls.length === 0 && issues.timeoutUrls.length === 0) {
    console.log('• ✅ 所有 URL 都可以正常访问');
  }
  
  console.log(`\n详细分析报告已保存到: ${REPORT_FILE}`);
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('开始详细分析 sitemap 中的 URL...');
    
    // 检查 sitemap 文件是否存在
    if (!fs.existsSync(SITEMAP_PATH)) {
      console.error(`错误: 找不到 sitemap 文件: ${SITEMAP_PATH}`);
      console.log('请先运行 npm run build 生成 sitemap');
      process.exit(1);
    }
    
    // 读取并解析 sitemap
    const xmlContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
    const urls = await extractUrlsFromSitemap(xmlContent);
    
    console.log(`从 sitemap 中找到 ${urls.length} 个 URL`);
    console.log('开始详细检查...（这可能需要几分钟）\n');
    
    // 逐个详细检查 URL（避免并发过多）
    const results = [];
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`检查 ${i + 1}/${urls.length}: ${url}`);
      
      const result = await detailedUrlCheck(url);
      results.push(result);
      
      // 显示简要结果
      if (!result.isValid) {
        console.log(`  ❌ 失败: ${result.statusCode || result.error}`);
      } else if (result.isSlow) {
        console.log(`  🐌 慢: ${result.responseTime}ms`);
      } else if (result.isLargeHtml) {
        console.log(`  📄 大: ${(result.contentLength / 1024).toFixed(1)}KB`);
      } else {
        console.log(`  ✅ 正常: ${result.responseTime}ms`);
      }
      
      // 避免请求过于频繁
      if (i < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // 分析结果
    const analysis = analyzeResults(results);
    
    // 保存详细报告
    fs.writeFileSync(REPORT_FILE, JSON.stringify(analysis, null, 2));
    
    // 生成报告
    generateDetailedReport(analysis);
    
  } catch (error) {
    console.error('分析过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { detailedUrlCheck, analyzeResults };