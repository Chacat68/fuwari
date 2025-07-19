image.png# Threads 集成指南

本指南将帮助您在 Fuwari 博客中集成 Meta Threads 内容。

## 功能概述

Threads 集成功能允许您：
- 在博客中显示您的最新 Threads 帖子
- 嵌入特定的 Threads 帖子
- 自定义显示样式和数量
- 支持缓存机制以提高性能
- 提供演示模式用于开发和测试

## 配置步骤

### 1. 获取 Threads API 访问权限

要使用 Threads API，您需要：

1. **创建 Meta 开发者账户**
   - 访问 [Meta for Developers](https://developers.facebook.com/)
   - 创建或登录您的开发者账户

2. **创建应用程序**
   - 在开发者控制台中创建新应用
   - 添加 Threads API 产品

3. **获取访问令牌**
   - 完成应用审核流程
   - 获取长期访问令牌
   - 确保令牌具有必要的权限（`threads_basic`、`threads_content_publish`）

### 2. 配置环境变量

在您的项目根目录创建或更新 `.env` 文件：

```env
# Threads API 配置
THREADS_ACCESS_TOKEN=your_threads_access_token_here
THREADS_USERNAME=your_threads_username
```

### 3. 更新配置文件

在 `src/config.ts` 中配置 Threads 集成：

```typescript
export const threadsConfig: ThreadsConfig = {
  enable: true,                    // 启用 Threads 集成
  username: 'your_username',       // 您的 Threads 用户名
  accessToken: process.env.THREADS_ACCESS_TOKEN || '',
  maxPosts: 5,                     // 最大显示帖子数量
  cacheTime: 15,                   // 缓存时间（分钟）
  fallbackToMock: false            // 是否在 API 失败时使用模拟数据
};
```

## 使用组件

### ThreadsFeed 组件

显示最新的 Threads 帖子：

```astro
---
import ThreadsFeed from '@/components/widget/ThreadsFeed.astro';
---

<!-- 基本使用 -->
<ThreadsFeed />

<!-- 自定义配置 -->
<ThreadsFeed 
  username="your_username"
  maxPosts={3}
  theme="dark"
/>

<!-- 嵌入特定帖子 -->
<ThreadsFeed 
  postId="specific_post_id"
  theme="light"
/>
```

### ThreadsFeedDemo 组件

用于开发和演示的组件，包含模拟数据：

```astro
---
import ThreadsFeedDemo from '@/components/widget/ThreadsFeedDemo.astro';
---

<ThreadsFeedDemo 
  username="demo_user"
  maxPosts={5}
/>
```

## API 端点

### GET /api/threads-posts

获取 Threads 帖子数据。

**查询参数：**
- `username` (可选): Threads 用户名
- `maxPosts` (可选): 最大帖子数量
- `postId` (可选): 特定帖子 ID

**响应示例：**
```json
{
  "success": true,
  "posts": [
    {
      "id": "post_id",
      "content": "帖子内容",
      "displayDate": "2024-01-01T00:00:00.000Z",
      "likes": 10,
      "replies": 5,
      "reposts": 2,
      "author": {
        "name": "用户名",
        "username": "username",
        "avatar": "头像URL"
      },
      "url": "帖子URL"
    }
  ],
  "cached": false
}
```

### POST /api/threads-posts

清除缓存。

**请求体：**
```json
{
  "action": "clearCache"
}
```

## 缓存机制

为了提高性能和遵守 API 速率限制，系统实现了缓存机制：

- **缓存时间**: 默认 15 分钟（可在配置中调整）
- **缓存存储**: 内存缓存
- **自动清理**: 缓存过期后自动清理
- **手动清理**: 可通过 API 端点手动清理

## 样式自定义

组件使用 CSS 变量，您可以通过覆盖这些变量来自定义样式：

```css
.threads-feed {
  --threads-bg: #ffffff;
  --threads-border: #e1e8ed;
  --threads-text: #14171a;
  --threads-text-secondary: #657786;
  --threads-primary: #000000;
  --threads-hover: #f7f9fa;
}
```

## 速率限制

Threads API 有以下速率限制：
- **帖子发布**: 24小时内最多 250 个帖子
- **回复**: 24小时内最多 1000 条回复
- **删除**: 24小时内最多 100 次删除
- **读取**: 每小时最多 1000 次请求

建议：
- 使用适当的缓存时间
- 避免频繁的 API 调用
- 监控 API 使用情况

## 故障排除

### 常见问题

1. **API 调用失败**
   - 检查访问令牌是否有效
   - 确认用户名是否正确
   - 验证网络连接

2. **帖子不显示**
   - 检查用户是否有公开帖子
   - 确认 API 权限设置
   - 查看浏览器控制台错误

3. **样式问题**
   - 检查 CSS 变量定义
   - 确认主题配置
   - 验证响应式设计

### 调试模式

启用调试模式以获取详细日志：

```typescript
// 在 threadsConfig 中添加
export const threadsConfig: ThreadsConfig = {
  // ... 其他配置
  fallbackToMock: true,  // 启用模拟数据
};
```

### 日志检查

检查服务器日志以获取详细错误信息：

```bash
# 开发模式
npm run dev

# 查看构建日志
npm run build
```

## 安全注意事项

1. **访问令牌安全**
   - 永远不要在客户端代码中暴露访问令牌
   - 使用环境变量存储敏感信息
   - 定期轮换访问令牌

2. **CORS 配置**
   - API 端点已配置适当的 CORS 头
   - 仅允许必要的域名访问

3. **数据验证**
   - 所有 API 响应都经过验证
   - 用户输入经过清理和验证

## 生产部署

### 环境变量设置

确保在生产环境中设置以下环境变量：

```bash
THREADS_ACCESS_TOKEN=your_production_token
THREADS_USERNAME=your_username
```

### 性能优化

1. **缓存策略**
   - 根据使用情况调整缓存时间
   - 考虑使用 Redis 等外部缓存

2. **CDN 配置**
   - 为静态资源配置 CDN
   - 启用图片优化

3. **监控**
   - 监控 API 使用情况
   - 设置错误报警
   - 跟踪性能指标

## 更新和维护

- 定期检查 Threads API 更新
- 监控弃用通知
- 更新依赖包
- 测试新功能

## 支持

如果您遇到问题或需要帮助：

1. 查看本文档的故障排除部分
2. 检查 [Meta Threads API 文档](https://developers.facebook.com/docs/threads)
3. 在项目仓库中创建 Issue

---

**注意**: Threads API 目前仍在发展中，某些功能可能会发生变化。请定期查看官方文档以获取最新信息。