---
title: 使用Notion搭建个人博客
published: 2023-04-25
updated: 2023-04-25
description: '使用 Notion 搭建个人博客的部署和配置过程。'
image: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250501042536930.png?imageSlim'
tags: [商业模式, 远程工作, 公司文化, 独立经营, 创新, 生产力]
category: '设计思考'
draft: false
---

> 本站 RSS地址已更新，麻烦读者朋友们重新订阅一次喔！

# 前言

在2023年初，我决定更换博客的托管方式，想找一个更加方便的方式。由于我是Notion的重度用户，于是我找到了[NotionNext](https://github.com/Chacat68/NotionNext)。

首先介绍一下 NotionNext。它是一个使用 NextJS + Notion API 实现的静态博客，支持多种部署方案。它无需服务器，搭建网站也非常容易。

我们将使用 Notion 作为存储文章的数据库，使用 Github + Vercel 作为管理和部署的工具，并使用 NotionNext 的代码渲染来展示我们的文章，创建一个博客网站。

那么，让我们开始吧！

# 📝 部署

## 前期准备

### 1、Fork NotionNext代码

先准备Github+Vercel的账号，先去往NotionNext在Github的库fork到自己的账户上

![202304251333863](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251333863.png)

https://github.com/tangly1024/NotionNext

### 2、Notion复制模版

前往下方的模版页面，点击复制副本按钮，把页面保存到自己的Notion

模版：[https://www.notion.so/tanghh/02ab3b8678004aa69e9e415905ef32a5?v=b7eb215720224ca5827bfaa5ef82cf2d&pvs=4](https://www.notion.so/02ab3b8678004aa69e9e415905ef32a5?pvs=21)

![202304251358159](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251358159.png)

在保存页面的右上角，点击分享按钮，开启分享到网络，并复制网页链接贴到游览器地址窗口

![202304251400967](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251400967.png)

在游览器地址窗口找到页面ID，具体参考下图：

![202304251402932](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251402932.png)

> 这张图片是从官方教程复制的
> 

## 开始部署

等待Github fork完，前往Vercel，添加新项目

[Dashboard – Vercel](https://vercel.com/dashboard)

![202304251351445](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251351445.png)

找到NotionNext项目，点击Import按钮进行部署

![202304251352510](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251352510.png)

点击Environment Variables（环境变量），并添加一个属性名称为NOTION_PAGE_ID，值为步骤一获取到的页面ID。

![202304251427618](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251427618.png)

把之前准备步骤里的页面ID复制到Value上，点击Deploy进行部署

## 部署完成

当出现这个页面时候，整个部署已经完成了。点击Go to Dashboard前往网站的控制台

![202304251430344](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251430344.png)

# 其他配置

## 绑定域名

在网站的控制台页面，找到Settings页面

![202304251432042](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251432042.png)

点击切换到 Domains 页面，输入域名并点击 add 按钮进行添加。添加成功后会出现域名解析所需的 IP 和服务器。前往域名管理页面，解析到指定地址即可。所有配置完成后，请耐心等待域名商进行解析。解析时间一般在 24 小时内生效，速度快慢不一。

![202304251435279](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251435279.png)

所有步骤都已经完成，现在可以快速访问自己的博客了！

## 配置中心（6月6号更新）

如果你的版本是 V4.1.0 之后的版本，支持该配置页面，有一些网站的基本配置在这里直接修改，而不用像之前需要去改 blog.config.js 才能生效

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/0c2456f7-0963-462e-bb9b-ede658d017ce/c8a3ecbd-263c-4b96-bf31-f124eb98f4ab/Untitled.png)

新建一个页面，去模型网页，照着把模型页面里的配置参数全部复制过来即可！

模版：[https://www.notion.so/tanghh/02ab3b8678004aa69e9e415905ef32a5?v=b7eb215720224ca5827bfaa5ef82cf2d&pvs=4](https://www.notion.so/02ab3b8678004aa69e9e415905ef32a5?pvs=21)

![qKcIrX](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/qKcIrX.png)

## 更新 (2024/11/30)

更新项目建议Fork原项目之后，在自己的项目中，新建分支进行更新操作。这样在后续更新发生冲突时候，可以不影响主干项目的更新，只修改网站项目。也可以建立多个分支去管理多个网站。

### 新建分支

在原项目中，新建分支，点击View all branches进入分支管理界面

![2024-11-30 at 16.48.14](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-11-30%20at%2016.48.14@2x.png)

进入分支管理界面后，点击New branch按钮，输入分支名称后，分支建立成功

![2024-11-30 at 16.49.13](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-11-30%20at%2016.49.13@2x.png)

### 版本更新

在上游项目有更新之后，可以在github上看到有更新的提示（如： 2 commits behind），这时可以点击：Sync fork按钮，再点击Update branch按钮，即可自动更新上游版本内容

![2024-11-30 at 16.47.04](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-11-30%20at%2016.47.04@2x.png)

点击更新之后，可以在Vercel后台看到正在编译这次更新的操作，等待编译完成即可。

> 💡 感谢您的观看！欢迎分享文章，或是来信与我交流。