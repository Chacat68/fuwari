# 二级菜单配置指南

本项目已支持导航栏二级菜单功能，包括桌面端悬停展开和移动端点击展开。

## 功能特性

- ✅ 桌面端鼠标悬停自动展开二级菜单
- ✅ 移动端点击展开/收起二级菜单
- ✅ 支持内部链接和外部链接
- ✅ 自动图标匹配
- ✅ 平滑动画效果
- ✅ 响应式设计

## 配置方法

在 `src/config.ts` 文件中的 `navBarConfig.links` 数组中，为需要二级菜单的导航项添加 `children` 属性：

```typescript
export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		{
			name: "项目",
			url: "/projects/",
			// 添加二级菜单
			children: [
				{
					name: "开源项目",
					url: "/projects/opensource/",
				},
				{
					name: "个人作品",
					url: "/projects/personal/",
				},
				{
					name: "合作项目",
					url: "/projects/collaboration/",
				},
			],
		},
		{
			name: "外部链接",
			url: "https://example.com/",
			external: true,
			// 外部链接也支持二级菜单
			children: [
				{
					name: "子链接1",
					url: "https://example.com/sub1/",
					external: true,
				},
				{
					name: "子链接2",
					url: "https://example.com/sub2/",
					external: true,
				},
			],
		},
	],
};
```

## 配置选项说明

### 主菜单项配置
- `name`: 菜单项显示名称
- `url`: 主菜单项的链接地址
- `external`: 是否为外部链接（可选）
- `children`: 二级菜单项数组（可选）

### 二级菜单项配置
- `name`: 子菜单项显示名称
- `url`: 子菜单项的链接地址
- `external`: 是否为外部链接（可选）

## 自动图标匹配

系统会根据URL路径自动匹配合适的图标：

### 主菜单图标
- `/` → 首页图标
- `/archive/` → 归档图标
- `/projects/` → 项目图标
- `/friends/` → 朋友图标
- `/moments/` → 时刻图标
- `/about/` → 关于图标
- 包含 `neodb` → 兴趣图标

### 子菜单图标
- 包含 `/opensource/` → 代码图标
- 包含 `/personal/` → 个人图标
- 包含 `/collaboration/` → 协作图标
- 包含 `/books/` → 书籍图标
- 包含 `/movies/` → 电影图标
- 包含 `/music/` → 音乐图标
- 其他 → 链接图标

## 样式自定义

二级菜单的样式定义在 `src/styles/main.css` 中的 `.nav-dropdown` 相关类中，你可以根据需要进行自定义：

```css
/* 桌面端二级菜单样式 */
.nav-dropdown-menu {
    /* 自定义下拉菜单样式 */
}

/* 移动端二级菜单样式 */
.nav-submenu {
    /* 自定义移动端子菜单样式 */
}
```

## 注意事项

1. 确保二级菜单对应的页面存在，否则会出现404错误
2. 外部链接的子菜单项也需要设置 `external: true`
3. 二级菜单最多建议不超过8个项目，以保证良好的用户体验
4. 移动端的二级菜单通过点击展开，桌面端通过鼠标悬停展开

## 示例效果

- **桌面端**: 鼠标悬停在有二级菜单的导航项上时，会显示下拉菜单，带有向上的小箭头指示
- **移动端**: 点击有二级菜单的导航项时，会展开显示子菜单项，再次点击可收起
- **动画效果**: 所有展开/收起操作都带有平滑的过渡动画