---
title: blog 劳动节改版小记
published: 2025-05-03 03:00:00
updated: 2025-05-03 03:00:00
description: '记录使用 fuwari 主题进行博客改版的过程，包括 Vercel 部署、从旧主题迁移功能（项目、友链、文章列表样式）以及使用 AI IDE 辅助开发的体验。'
image: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250503031704734.png?imageSlim'
tags: [Astro, fuwari, Vercel, 博客, 主题定制, 前端开发, AI编程]
category: '生活随笔'
draft: false
---

> 本站 RSS地址已更新，麻烦读者朋友们重新订阅一次喔！

## 前言

博客重建后，我一直在调整网站细节。最初基于重度使用的 Notion 选择了 [NotionNext](https://notion-next-kohl-rho-39.vercel.app/)，但感觉过于臃肿。因此，在去年底的时候我决定转向 Astro，把网站的加载速度和体验进行了优化。

切换到 Astro 时，我选择了 [astro-gyoza](https://github.com/lxchapu/astro-gyoza) 主题。其出色的性能让我深刻体验到了静态网站的极速优势。正好五一放假，我决定把 blog 重新做一下。

这次找了一个好看的模板 [fuwari](https://github.com/saicaca/fuwari) ，然后就开始了我的博客装修之旅。

## 重新部署

我选择使用 Vercel 来部署我的网站。整个部署流程相当简洁：首先 Fork `fuwari` 项目，然后在 Vercel 中关联你的 GitHub 账号，即可启动部署。

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250502234237550.png?imageSlim)

接着，访问 Vercel 控制台，找到对应的项目，点击 "Deploy" 按钮开始部署过程。

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250502234327982.png?imageSlim)

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250502234432832.png?imageSlim)

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250502234451092.png?imageSlim)

部署成功后，你可以在 Vercel 控制台中查看到网站的访问地址。

## 功能迁移

在使用 `astro-gyoza` 主题期间，我特别喜欢其中的一些功能。然而，在切换到 `fuwari` 主题后，发现这些功能并未内置。因此，我决定动手将它们迁移过来。

### 项目页面

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250502234738212.png?imageSlim)

我将原主题中项目展示的图片、标题和描述功能迁移至新主题，并借鉴了 `gyoza` 主题归档页面的时间滚动样式，应用在新的项目页面。

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250503025806690.png?imageSlim)

### 友链页面

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250503030027875.png?imageSlim)

`fuwari` 主题本身不包含友链功能。我将之前主题的友链页面迁移了过来，并额外添加了代码复制功能，方便复制代码片段。

### 精简文章列表

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250503030217022.png?imageSlim)

原 `fuwari` 主题的文章列表会显示分类、标签、发布时间等元信息。为了保持列表的简洁性，我选择隐藏了这些元素。

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250503030317637.png?imageSlim)

### 首页封面

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250503135534706.png?imageSlim)

首页的封面图是之前用 midjourney 生成的，灵感是中国色的水墨山水画。

## 结语

这次迁移过程让我深刻体会到现代前端框架的成熟与强大。尤其是在 AI IDE 的辅助下，大部分工作不再需要手动编写代码，而是通过提供图片和清晰的需求描述来完成页面构建。

AI 确实已经成长为一名得力的编程助理。这两天的调试与修改过程，让我体验到了高中时代在网吧里沉浸在写代码和做游戏中的快乐。

希望，AI 能帮我们找回最初的好奇心，写代码愉快！！！

---

> 💡 感谢您的观看！欢迎分享文章，或是来信与我交流。
