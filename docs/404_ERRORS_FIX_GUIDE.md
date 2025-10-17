# 404 错误修复指南

## 🔍 问题描述

在浏览器控制台中看到以下 404 错误:
- `Layout.astro_astro_type_script_index_0_lang.DAHrxWCB.js` - 404
- `roboto-latin-400-normal.CNwBRw8h.woff2` - 404
- `roboto-latin-500-normal.CkrA1NAy.woff2` - 404
- `Layout.DSulWsr7.css` - 404
- Bilibili 用户指纹脚本报错

## ✅ 解决方案

### 1. 清理缓存并重启开发服务器

```bash
# 停止所有开发服务器
pkill -f "astro|vite"

# 清理构建缓存
rm -rf .astro dist

# 重新启动开发服务器
pnpm dev
```

### 2. 清理浏览器缓存

**Chrome/Edge:**
1. 打开开发者工具 (F12)
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

**快捷方式:**
- **Mac**: `Cmd + Shift + R`
- **Windows/Linux**: `Ctrl + Shift + R`

### 3. 检查开发服务器是否正常运行

确认终端输出显示:
```
astro  v5.x.x ready in xxxx ms

┃ Local    http://localhost:4321/
┃ Network  use --host to expose
```

## ⚠️ 已知的第三方问题

### Bilibili 指纹脚本错误

```
bili-user-fingerprint.min.js:1 @bilibili/bili-user-fingerprint(report): report is not found
```

**说明:**
- 这是 Bilibili iframe 播放器加载的第三方脚本
- 你无法控制这个错误
- **不影响你的网站功能**
- 可以安全忽略

## 🔄 完整的故障排除流程

### 方法 1: 快速修复
```bash
# 一键清理并重启
rm -rf .astro dist && pnpm dev
```

### 方法 2: 完全重置
```bash
# 停止服务器
pkill -f "astro|vite"

# 清理所有缓存
rm -rf .astro dist node_modules/.vite

# 清理并重新安装依赖(如果需要)
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 重新启动
pnpm dev
```

### 方法 3: 生产构建预览
```bash
# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 📝 预防措施

### 1. 定期清理缓存
```bash
# 添加到 package.json scripts
"clean": "rm -rf .astro dist node_modules/.vite",
"fresh": "pnpm clean && pnpm dev"
```

### 2. 使用浏览器无痕模式测试
- 避免缓存干扰
- 快速验证问题是否真正修复

### 3. 检查 Astro 配置

确保 `astro.config.mjs` 中的配置正确:
```javascript
export default defineConfig({
    site: process.env.NODE_ENV === 'development' 
        ? "http://localhost:4321/" 
        : "https://www.chawfoo.com/",
    base: "/",
    trailingSlash: "always",
    // ...
});
```

## 🐛 调试技巧

### 查看网络请求
1. 打开浏览器开发者工具
2. 切换到 Network 标签
3. 刷新页面
4. 查看失败的请求:
   - 请求的完整 URL
   - 响应状态码
   - 请求来源

### 检查资源文件
```bash
# 开发模式 - 资源由 Vite 处理,不在 dist 目录
pnpm dev

# 生产模式 - 检查 dist 目录
pnpm build
ls -la dist/_astro/ | grep -i "roboto\|Layout"
```

## 📊 常见原因

| 错误类型   | 可能原因             | 解决方案                 |
| ---------- | -------------------- | ------------------------ |
| 资源 404   | 旧的浏览器缓存       | 清空缓存并硬性重新加载   |
| 资源 404   | 开发服务器未完全启动 | 等待 Vite 完成优化       |
| 资源 404   | 构建缓存损坏         | 删除 .astro 和 dist 目录 |
| 字体 404   | 字体包未安装         | 运行 `pnpm install`      |
| 第三方错误 | 外部脚本问题         | 安全忽略(如 Bilibili)    |

## ✨ 验证修复

修复后应该看到:
- ✅ 控制台没有 404 错误(除了第三方脚本)
- ✅ 页面正常加载和显示
- ✅ 字体正确渲染
- ✅ 样式正常应用

## 🔗 相关文档

- [CONSOLE_ERRORS_FIX_REPORT.md](./CONSOLE_ERRORS_FIX_REPORT.md)
- [CONSOLE_ERRORS_FIX_REPORT_2025.md](./CONSOLE_ERRORS_FIX_REPORT_2025.md)
- [Astro 故障排除](https://docs.astro.build/en/guides/troubleshooting/)

---

*最后更新: 2025年10月18日*
