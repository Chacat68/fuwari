# X平台 (Twitter) API 集成指南

本文档介绍如何在Fuwari博客中集成X平台API，实现真实推文数据的显示。

## 功能特性

- ✅ 自动获取指定用户的最新推文
- ✅ 支持推文图片显示
- ✅ 智能缓存机制，减少API调用
- ✅ API失败时自动回退到模拟数据
- ✅ 与"此刻"时间线完美融合
- ✅ 响应式设计，适配各种屏幕尺寸

## 配置步骤

### 1. 获取X平台API密钥

1. 访问 [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. 创建一个新的应用程序
3. 获取以下API密钥：
   - **Bearer Token** (推荐，用于只读操作)
   - API Key 和 API Secret
   - Access Token 和 Access Token Secret

### 2. 配置环境变量

1. 复制 `.env.example` 文件为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入你的API密钥：
   ```env
   # 推荐使用Bearer Token（适用于只读操作）
   TWITTER_BEARER_TOKEN=your_bearer_token_here
   
   # 或者使用完整的API密钥
   TWITTER_API_KEY=your_api_key_here
   TWITTER_API_SECRET=your_api_secret_here
   TWITTER_ACCESS_TOKEN=your_access_token_here
   TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
   ```

### 3. 启用X平台集成

编辑 `src/config.ts` 文件：

```typescript
export const xTwitterConfig: XTwitterConfig = {
  enable: true, // 设置为 true 启用API
  username: "your_twitter_username", // 你的X平台用户名
  maxTweets: 10, // 最大获取推文数量
  cacheTime: 30, // 缓存时间（分钟）
  fallbackToMock: true, // API失败时使用模拟数据
};
```

### 4. 重启开发服务器

```bash
pnpm dev
```

## 配置选项说明

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enable` | boolean | false | 是否启用X平台API集成 |
| `username` | string | "Chacat68" | X平台用户名 |
| `bearerToken` | string | - | Bearer Token（推荐） |
| `apiKey` | string | - | API密钥 |
| `apiSecret` | string | - | API密钥 |
| `accessToken` | string | - | 访问令牌 |
| `accessTokenSecret` | string | - | 访问令牌密钥 |
| `maxTweets` | number | 10 | 最大获取推文数量 |
| `cacheTime` | number | 30 | 缓存时间（分钟） |
| `fallbackToMock` | boolean | true | API失败时是否使用模拟数据 |

## API使用说明

### 获取推文数据

```typescript
import { getXTweets } from '../utils/x-twitter-api';

// 获取推文（带缓存）
const tweets = await getXTweets();

// 清除缓存（强制刷新）
import { clearXTweetsCache } from '../utils/x-twitter-api';
clearXTweetsCache();

// 获取模拟数据（用于开发测试）
import { getMockXTweets } from '../utils/x-twitter-api';
const mockTweets = getMockXTweets();
```

### 推文数据结构

```typescript
interface XTweet {
  id: string;           // 推文ID
  content: string;      // 推文内容
  displayDate: Date;    // 发布时间
  likes: number;        // 点赞数
  replies: number;      // 回复数
  retweets: number;     // 转发数
  type: 'x-tweet';     // 类型标识
  images?: string[];    // 图片URL数组
  author?: {            // 作者信息
    name: string;
    username: string;
    avatar?: string;
  };
}
```

## 故障排除

### 常见问题

1. **API调用失败**
   - 检查API密钥是否正确
   - 确认API密钥有足够的权限
   - 检查网络连接

2. **CORS错误**
   - X平台API不支持直接从浏览器调用
   - 考虑使用服务端API路由
   - 当前实现会自动回退到模拟数据

3. **缓存问题**
   - 使用 `clearXTweetsCache()` 清除缓存
   - 调整 `cacheTime` 配置

### 开发模式

在开发过程中，如果不想配置真实的API密钥，可以：

1. 保持 `enable: false`
2. 或者设置 `fallbackToMock: true`

这样系统会自动使用模拟数据，不会影响开发体验。

## 安全注意事项

1. **永远不要将API密钥提交到版本控制系统**
2. **使用环境变量存储敏感信息**
3. **定期轮换API密钥**
4. **限制API密钥的权限范围**

## 生产部署

在生产环境中部署时，确保：

1. 在服务器上设置正确的环境变量
2. 使用HTTPS协议
3. 监控API使用量，避免超出限制
4. 设置合适的缓存时间，减少API调用

## 更多资源

- [Twitter API v2 文档](https://developer.twitter.com/en/docs/twitter-api)
- [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
- [API使用限制](https://developer.twitter.com/en/docs/twitter-api/rate-limits)