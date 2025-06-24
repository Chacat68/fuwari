---
title: 从零开始：5小时内的Godot游戏制作
published: 2024-05-25
updated: 2024-05-25
description: '使用Godot4.2的体验记录，它比3.x阶段的使用体验成熟不少，现在可以作为一个创作工具去使用。'
image: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250501174647235.png?imageSlim'
tags: [Godot, 使用经验, 创作, 工具]
category: '设计思考'
draft: false
---

> 本站 RSS地址已更新，麻烦读者朋友们重新订阅一次喔！

## 前言

最近因为[Brackeys的教程](https://youtu.be/LOhfqjmasi0?si=CJVbxxd2kuC231Ct)，同时也在做技术调研，就跟着教程把游戏原型给做了出来。

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/nyFavE.png)

Github地址：（上传有问题，后续补充链接）

## 制作过程

### 节点Nodes

每个节点等于是游戏内的一个模块，也可以理解成一个小功能，例如：捡金币，整个逻辑可以单独用一个节点来实现，在金币节点下，可以捆绑动画，代码等内容

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-05-24%20at%2023.24.56.png)

### Player 玩家

实现了玩家控制的角色小人，包含它的动作（行走、跳跃）、动画等逻辑，基本用编辑器实现差不多，一些行为逻辑代码改一下自带的GDSerint脚本即可

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-05-24%20at%2023.33.44.png)

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-05-24%20at%2023.34.10.png)

### 场景World building

使用地图编辑器，导入了美术资产，核心操作是基于瓦片地图的格子，整体编辑体验易上手。有一个小创新是可以直接在格子上赋予碰撞逻辑，省下单独编辑碰撞层的麻烦。

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-05-24%20at%2023.31.36.png)

### 敌人 Enemy

实现了一个小怪移动、碰撞和动画

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-05-24%20at%2023.47.45.png)

### 行为逻辑

### 平台移动

制作了一个可来回移动的逻辑节点，应用在怪物和场景移动平台上

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-05-24%20at%2023.38.41.png)

### 金币获取

制作了金币常态动画

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-05-24%20at%2023.40.48.png)

用动画工具巧妙实现消失动画和音效的逻辑，在代码里简单引用即可使用。

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-05-24%20at%2023.41.16.png)

### 角色死亡

实现了角色掉出边界、碰到怪物的死亡逻辑，本质是用碰撞盒去实现，第一集的教程里还没教死亡动画，但是美术资产里有资源，可以自主发挥实现。

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-05-24%20at%2023.44.41.png)

还有打包导出、音乐等功能大家在教程里自行探索，本文不再赘述。

### 使用体验

4.0 的生态已经足够成熟，工具链的可用性已经不错，我花费了一个下午 5 个小时左右就把功能全部写完，已经非常高效，完全可以达到一个可用的标准。

当然，这篇体验文章也只是简单做演示 demo，大家需要谨慎考虑是否应用在正式项目上。我建议可以写个小demo测试一下，像玩一次GameJam，把想做的游戏做一次，应该就有答案了。

---

> 💡 感谢您的观看！欢迎分享文章，或是来信与我交流。