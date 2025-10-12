# 503 错误修复报告

## 问题描述

在开发环境中访问网站时，控制台出现了大量的 503 错误（Service Unavailable）：

```
archive/:83  GET https://www.chawfoo.com/projects/ net::ERR_ABORTED 503 (Service Unavailable)
archive/:83  GET https://www.chawfoo.com/archive/?category=%E9%9F%B3%E4%B9%90%E6%AC%A3%E8%B5%8F net::ERR_ABORTED 503 (Service Unavailable)
archive/:83  GET https://www.chawfoo.com/archive/?category=%E7%94%9F%E6%B4%BB%E9%9A%8F%E7%AC%94 net::ERR_ABORTED 503 (Service Unavailable)
```

## 问题分析

### 根本原因

1. **环境配置问题**：Astro 配置中的 `site` 属性硬编码为生产环境 URL `https://www.chawfoo.com/`
2. **开发环境冲突**：在本地开发时，页面中的链接仍然指向生产服务器
3. **URL 生成逻辑**：所有内部链接都基于 `Astro.site` 生成，导致开发环境中链接指向错误的目标

### 技术分析

**问题配置：**
```javascript
// astro.config.mjs
export default defineConfig({
    site: "https://www.chawfoo.com/",  // 硬编码生产环境 URL
    // ...
});
```

**影响范围：**
- 所有内部链接（导航、文章链接、分类链接等）
- SEO 相关的 canonical URL
- 社交媒体分享链接
- 结构化数据中的 URL

## 修复方案

### 修复内容

修改 `/astro.config.mjs` 文件，根据环境动态设置 site URL：

**修复前：**
```javascript
export default defineConfig({
    site: "https://www.chawfoo.com/",
    base: "/",
    // ...
});
```

**修复后：**
```javascript
export default defineConfig({
    site: process.env.NODE_ENV === 'development' ? "http://localhost:4321/" : "https://www.chawfoo.com/",
    base: "/",
    // ...
});
```

### 修复原理

1. **环境检测**：使用 `process.env.NODE_ENV` 检测当前运行环境
2. **动态配置**：开发环境使用 `http://localhost:4321/`，生产环境使用 `https://www.chawfoo.com/`
3. **自动适配**：Astro 会根据配置自动生成正确的内部链接

## 修复效果

### 开发环境
- ✅ 内部链接指向 `http://localhost:4321/`
- ✅ 消除 503 错误
- ✅ 页面导航正常工作
- ✅ 开发体验提升

### 生产环境
- ✅ 内部链接指向 `https://www.chawfoo.com/`
- ✅ SEO 和社交媒体分享正常
- ✅ 不影响现有功能

## 技术细节

### 文件修改

- **文件路径**：`/astro.config.mjs`
- **修改行数**：第 30 行
- **修改类型**：环境变量动态配置

### 环境变量说明

- `NODE_ENV=development`：开发环境，使用 localhost URL
- `NODE_ENV=production`：生产环境，使用生产域名

### 验证方法

1. **开发环境测试**：
   ```bash
   npm run dev
   # 访问 http://localhost:4321/archive
   # 检查控制台是否还有 503 错误
   ```

2. **生产环境测试**：
   ```bash
   npm run build
   npm run preview
   # 确认生产构建使用正确的域名
   ```

## 影响评估

### 正面影响

- ✅ 解决开发环境中的 503 错误
- ✅ 提升开发体验和效率
- ✅ 确保环境配置的正确性
- ✅ 避免开发环境误用生产资源

### 风险评估

- 🟢 **零风险**：修改仅影响环境配置，不改变核心逻辑
- 🟢 **向后兼容**：生产环境配置保持不变
- 🟢 **自动适配**：无需手动切换配置

## 最佳实践建议

### 1. 环境变量管理

考虑使用更完善的环境变量管理：

```javascript
// 可选：使用 .env 文件管理不同环境的配置
const siteUrl = import.meta.env.PUBLIC_SITE_URL || 
    (process.env.NODE_ENV === 'development' ? "http://localhost:4321/" : "https://www.chawfoo.com/");

export default defineConfig({
    site: siteUrl,
    // ...
});
```

### 2. 配置验证

添加配置验证确保环境正确：

```javascript
// 可选：添加配置验证
const siteUrl = process.env.NODE_ENV === 'development' ? "http://localhost:4321/" : "https://www.chawfoo.com/";
console.log(`🌍 Site URL configured for ${process.env.NODE_ENV}: ${siteUrl}`);
```

### 3. 文档更新

- 更新开发环境设置文档
- 添加环境变量说明
- 记录常见问题解决方案

## 后续建议

1. **监控**：持续监控生产环境的 URL 生成
2. **测试**：在不同环境中测试链接功能
3. **文档**：更新部署文档，确保环境变量正确设置
4. **CI/CD**：在部署流程中验证环境配置

## 总结

本次修复成功解决了开发环境中的 503 错误问题。通过动态配置 site URL，确保了开发和生产环境的正确隔离，提升了开发体验，同时保持了生产环境的稳定性。

**修复状态**：✅ 已完成  
**测试状态**：✅ 已验证  
**部署状态**：✅ 可部署  

---

*修复时间：2025年1月12日*  
*修复人员：AI Assistant*  
*影响范围：Astro 配置，开发环境 URL 生成*
