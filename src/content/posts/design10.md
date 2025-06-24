---
title: ComfyUI实战：模型、插件与工作流全解析
published: 2024-10-03
updated: 2024-10-03
description: 'ComfyUI 是一个专为 Stable Diffusion 设计的基于节点的图形用户界面。'
image: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250501174614910.png?imageSlim'
tags: [ComfyUI, 实践经验, 创作, 工具]
category: '人工智能'
draft: false
---

> 本站 RSS地址已更新，麻烦读者朋友们重新订阅一次喔！

# ComfyUI 介绍

ComfyUI 是一个专为 **Stable Diffusion** 设计的基于节点的图形用户界面（GUI），旨在简化和优化图像生成过程。通过将整个图像生成过程分解为多个独立的节点，使用户能够灵活地构建和调整工作流。

每个节点执行特定的功能，如加载模型、输入文本提示、生成图像等。这种结构使得用户可以更好地控制生成过程，提升了可定制性和复现性。

**Github 地址**

https://github.com/comfyanonymous/ComfyUI

## 安装方式

### 命令行安装 (Mac)

安装 ComfyUI 的步骤相对简单，通常包括以下几个步骤：

1. 克隆存储库
    - 打开终端应用程序
    - 输入：git clone [git@github.com](mailto:git@github.com):comfyanonymous/ComfyUI.git

1. 安装依赖项
    - [安装Miniconda](https://docs.anaconda.com/free/miniconda/index.html#latest-miniconda-installer-links)。这将帮助您安装ComfyUI所需的Python和其他库的正确版本。
    - 用Conda创造环境。
        - 输入：conda create-n comfyenv
        - 输入：conda activate comfyenv
    - 安装GPU扩展（Mac）
        - cd comtyU
        - pip install -r requirements.txt
    - 启动应用程序
        - cd ComfyUI
        - python [main.py](http://main.py/)

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-10-03%20at%2015.56.10@2x.png)

[更多平台安装细节](https://docs.comfy.org/get_started/manual_install)

全部安装完毕后，可以通过浏览器访问 `http://127.0.0.1:8188/` 来打开操作界面

## 客户端安装

### Comflowy Space

Comflowy Space 是基于 ComfyUI 进行二次开发的产品，其内核依然是 ComfyUI，是一个方便管理的整合客户端。

**官网**

https://comflowy.com/zh-CN

**Github 地址**

https://github.com/6174/comflowy

### 模型管理

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-09-12%20at%2009.09.43.png)

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-09-12%20at%2009.19.30.png)

客户端提供直接下载管理模型的功能，用户可通过官方渠道或Civitai进行下载。下载完成后，模型会保存在本地的指定文件夹中。

### 插件管理

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-09-12%20at%2009.30.00.png)

客户端提供插件下载，用户可通过社区插件渠道，直接搜索下载即可。有需要更新的插件，右上角会显示更新按钮。

## 云平台

### 揽睿星舟

一个租用云端服务器的网站，按时间计费，集成ComfyUI和SD WebUl的镜像，用户可以快速创建。

网站地址：
https://www.lanrui-ai.com/console/overview

### Comflowy

Comflowy Space的云端服务版本，可以把Comflowy Space的工作流一键部署到云端上，UI的操作逻辑和本地开源版本是一样的。

网站地址：
https://www.comflowy.com/zh-CN/preparation-for-study/install-cloud

# 工作流

ComfyUI 比较方便一个点就是可以直接使用其他人创建的流程，直接拖拽到UI范围内或是点击载入按钮即可使用。

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-10-03%20at%2015.54.48@2x.png)

## 工作流社区

### OpenArt Workflows

OpenArt 提供了一个平台，用户可以发现、分享和运行各种 **ComfyUI 工作流程**，这些工作流程旨在利用人工智能促进创意任务。

网站地址：
https://openart.ai/workflows/all

### liblib

[LibLib.AI](http://liblib.ai/) 是一个中文网站，类似于 CivitAI，提供了大量精细入微的AI绘画模型供免费下载，现在也提供工作流的分享。

网站地址：
https://www.liblib.art/workflows

# 模型

## 模型网站

### Civitai

Civitai是一个专注于AI生成艺术的在线平台，主要提供**Stable Diffusion**和**Flux**模型的分享与下载。

https://civitai.com/models

### liblib

[LibLib.AI](http://liblib.ai/) 是一个中文网站，类似于 CivitAI，提供了大量精细入微的AI绘画模型供免费下载，现在也提供工作流的分享。

地址：
https://www.liblib.art/

### 模型安装

在模型网站上找到想要的模型，下载到本地，放到Checkpoint、LORA等文件夹里，

Checkpoint：原始模型，有**Stable Diffusion**和**Flux**模型两种

- **Stable Diffusion**比较成熟，有1.5、XL几个版本分支
- **Flux**是SD原班人马新打造的模型

LoRA：滤镜模型，在原始模型的基础上，对生成内容做风格化调整。

另一种安装方法，装上ComfyUl-Manager插件，在管理器界面，可以直接安装。

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-09-27%20at%2017.08.27@2x.png)

## 插件

插件可以理解成第三方节点，是由开源社区里的开发者做的整合包，比原生的节点功能要更加丰富。

### 插件安装

### ComfyUI管理器

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-10-03%20at%2016.12.15@2x.png)

### 节点管理

这是一个节点商店，在搜索框直接能搜索到想要的插件。

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-10-03%20at%2016.14.44@2x.png)

### 安装缺失节点

如果下载别人分享的工作流，遇到了缺失的节点，拖拽到工作流里会弹出这窗口。

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-10-03%20at%2016.19.01@2x.png)

通过**ComfyUI管理器**上的**安装缺失节点**按钮，会把所有缺失的节点列出来。

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-10-03%20at%2016.19.45@2x.png)

## 结束

ComfyUI的生态正在蓬勃发展，这篇文章只是把最基础的内容记录下来分享给大家，后续有时间再去写工作流和模型的细节。感谢你的阅读时间，希望你喜欢！

---

> 💡 感谢您的观看！欢迎分享文章，或是来信与我交流。