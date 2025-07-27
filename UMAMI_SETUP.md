# Umami 统计集成指南

本项目已集成 Umami 统计功能，这是一个现代化、注重隐私的 Google Analytics 替代方案。

## 配置步骤

### 1. 部署 Umami 服务

您可以选择以下方式之一部署 Umami：

#### 方式一：使用 Docker（推荐）

```bash
# 克隆 Umami 仓库
git clone https://github.com/umami-software/umami.git
cd umami

# 启动服务（包含 PostgreSQL 数据库）
docker compose up -d
```

#### 方式二：从源码安装

```bash
# 克隆仓库
git clone https://github.com/umami-software/umami.git
cd umami

# 安装依赖
npm install

# 配置数据库连接
echo "DATABASE_URL=postgresql://username:password@localhost:5432/umami" > .env

# 构建应用
npm run build

# 启动服务
npm run start
```

#### 方式三：使用云服务

您也可以使用 Umami 官方的云服务或其他支持 Umami 的托管平台。

### 2. 创建网站

1. 访问您的 Umami 管理界面（默认：http://localhost:3000）
2. 使用默认账户登录：
   - 用户名：`admin`
   - 密码：`umami`
3. 在设置中添加新网站
4. 记录生成的网站 ID

### 3. 配置博客

编辑 `src/config.ts` 文件中的 Umami 配置：

```typescript
export const siteConfig: SiteConfig = {
  // ... 其他配置
  
  // Umami 统计配置
  umami: {
    enable: true, // 设置为 true 启用统计
    websiteId: "your-actual-website-id", // 替换为您的实际网站 ID
    src: "https://your-umami-domain.com/script.js", // 替换为您的 Umami 服务器地址
  },
  
  // ... 其他配置
};
```

### 4. 配置说明

- `enable`: 控制是否启用 Umami 统计
- `websiteId`: 在 Umami 管理界面中创建网站后获得的唯一 ID
- `src`: Umami 统计脚本的完整 URL 地址

### 5. 验证配置

1. 重新构建并启动您的博客
2. 访问网站页面
3. 在 Umami 管理界面中查看是否有访问数据

## 功能特点

- **隐私友好**：不使用 cookies，符合 GDPR 要求
- **轻量级**：脚本大小小于 2KB
- **实时统计**：提供实时访问数据
- **自托管**：完全控制您的数据
- **开源**：代码完全开源，可自由定制

## 故障排除

### 统计数据不显示

1. 检查 `websiteId` 是否正确
2. 确认 Umami 服务器地址是否可访问
3. 检查浏览器控制台是否有错误信息
4. 确认 Umami 服务正常运行

### 禁用统计

如果需要临时禁用统计，只需将配置中的 `enable` 设置为 `false`：

```typescript
umami: {
  enable: false, // 禁用统计
  // ... 其他配置保持不变
},
```

## 更多信息

- [Umami 官方文档](https://umami.is/docs)
- [Umami GitHub 仓库](https://github.com/umami-software/umami)
- [Umami 演示站点](https://analytics.umami.is/share/LGazGOecbDtaIwDr/umami.is)