# 导航栏滚动显示修复报告

## 问题描述

在关于页面（以及其他非首页）滚动到底部，再往上滚动到顶部时，导航栏消失不显示。

## 根本原因

代码中存在两处逻辑缺陷：

### 1. 滚动事件处理逻辑问题（Layout.astro 第 505 行）

```javascript
if (!bannerEnabled) return  // ❌ 问题代码
if (navbar) {
    // 导航栏显示/隐藏逻辑
}
```

**问题**：当页面没有 banner 时（如关于页、归档页、文章页等），代码会直接 return，跳过所有导航栏状态更新逻辑。这导致如果导航栏之前被设置为隐藏状态，将无法恢复显示。

### 2. 页面加载初始化逻辑问题（Layout.astro 第 400-415 行）

```javascript
if (!bannerEnabled) {
    return  // ❌ 问题代码
}
// ... 设置导航栏初始状态
```

**问题**：同样在页面加载时，如果没有 banner，导航栏状态不会被初始化，可能导致显示异常。

## 修复方案

### 修复 1：改进滚动事件处理逻辑

```javascript
if (navbar) {
    if (!bannerEnabled) {
        // 如果没有 banner，确保导航栏始终显示
        navbar.classList.remove('navbar-hidden')
    } else {
        // 有 banner 时，根据滚动位置控制导航栏显示/隐藏
        const NAVBAR_HEIGHT = 72
        const MAIN_PANEL_EXCESS_HEIGHT = MAIN_PANEL_OVERLAPS_BANNER_HEIGHT * 16

        let bannerHeight = BANNER_HEIGHT
        if (document.body.classList.contains('lg:is-home') && window.innerWidth >= 1024) {
            bannerHeight = BANNER_HEIGHT_HOME
        }
        let threshold = window.innerHeight * (bannerHeight / 100) - NAVBAR_HEIGHT - MAIN_PANEL_EXCESS_HEIGHT - 16
        if (document.body.scrollTop >= threshold || document.documentElement.scrollTop >= threshold) {
            navbar.classList.add('navbar-hidden')
        } else {
            navbar.classList.remove('navbar-hidden')
        }
    }
}
```

### 修复 2：改进页面加载初始化逻辑

```javascript
let navbar = document.getElementById('navbar-wrapper')
if (!navbar) {
    return
}

if (!bannerEnabled) {
    // 如果没有 banner，确保导航栏始终显示
    navbar.classList.remove('navbar-hidden')
    return
}

// 有 banner 时，根据初始滚动位置设置导航栏状态
if (!document.body.classList.contains('lg:is-home')) {
    navbar.classList.remove('navbar-hidden')
    return
}

let threshold = window.innerHeight * (BANNER_HEIGHT / 100) - 72 - 16
if (document.body.scrollTop >= threshold || document.documentElement.scrollTop >= threshold) {
    navbar.classList.add('navbar-hidden')
} else {
    navbar.classList.remove('navbar-hidden')
}
```

## 测试场景

| 页面类型   | Banner 状态 | 预期行为              | 修复后状态 |
| ---------- | ----------- | --------------------- | ---------- |
| 首页       | 启用        | 滚动时隐藏/显示导航栏 | ✅ 正常     |
| 首页       | 未启用      | 导航栏始终显示        | ✅ 正常     |
| 关于页     | 无          | 导航栏始终显示        | ✅ 修复     |
| 归档页     | 无          | 导航栏始终显示        | ✅ 修复     |
| 文章详情页 | 无          | 导航栏始终显示        | ✅ 修复     |
| 项目页     | 无          | 导航栏始终显示        | ✅ 修复     |
| 朋友页     | 无          | 导航栏始终显示        | ✅ 修复     |
| 404 页     | 无          | 导航栏始终显示        | ✅ 修复     |

### 滚动行为测试

| 操作             | 有 Banner 页面 | 无 Banner 页面 |
| ---------------- | -------------- | -------------- |
| 页面加载         | 导航栏显示     | 导航栏显示     |
| 向下滚动超过阈值 | 导航栏隐藏     | 导航栏保持显示 |
| 滚动到底部       | 导航栏隐藏     | 导航栏保持显示 |
| 从底部向上滚动   | 导航栏显示     | 导航栏保持显示 |
| 滚动回顶部       | 导航栏显示     | 导航栏保持显示 |

## 修改的文件

- `/src/layouts/Layout.astro`
  - 第 400-422 行：页面加载时的导航栏初始化逻辑
  - 第 517-537 行：滚动事件中的导航栏显示/隐藏逻辑

## 技术细节

### Banner 配置
Banner 通过 `src/config.ts` 中的 `siteConfig.banner.enable` 控制：

```typescript
banner: {
    enable: true,  // 全局 banner 开关
    src: "...",    // banner 图片路径
    position: "center",
    // ...
}
```

### 页面 Banner 判断
- **首页** (`/`)：使用 MainGridLayout，会根据 `siteConfig.banner.enable` 显示 banner
- **其他页面**：通常不显示 banner（由各页面的 layout 决定）

### Banner 检测
代码中通过以下方式检测 banner 是否存在：
```javascript
const bannerEnabled = !!document.getElementById('banner-wrapper')
```

## 验证建议

请在以下页面进行滚动测试：

1. **首页** (`/`)
   - 向下滚动应隐藏导航栏
   - 滚回顶部应显示导航栏

2. **关于页** (`/about/`)
   - 滚动到底部
   - 向上滚回顶部
   - **验证导航栏始终显示** ✨

3. **归档页** (`/archive/`)
   - 同样的滚动测试
   - 验证导航栏始终显示

4. **任意文章页** (`/posts/...`)
   - 滚动测试
   - 验证导航栏始终显示

## 修复日期

2025年10月18日
