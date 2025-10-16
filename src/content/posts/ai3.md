---
title: Ollama 本地大模型部署教程
published: 2024-03-09
updated: 2024-03-09
description: 'Ollama本地大模型的使用教程，提及Ollama推荐模型列表：Llama、Mistral、Qwen2等.'
image: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250501175723783.png?imageSlim'
tags: [AI, 设计, Ollama, 工具, 效率, 本地]
category: '人工智能'
draft: false
---

> 由于OpenAI服务不稳定，我打算不再续费。我将寻找其它替代产品，例如，用NotionAI处理文档，用GitHub Copilot写代码，对于一些翻译和文本处理工作，我选择Ollama。

## Ollama 本地大模型

Ollama是一个开源框架，用于在本地运行大型语言模型（LLM）。它为开发人员和研究人员提供了一个集成的平台，可以方便地搭建、训练和分享他们的语言模型。

更多细节可以参考Github上的文档：

https://github.com/ollama/ollama

### 如何使用Ollama

Ollama的使用非常简单，只需几个步骤即可：

1. 安装Ollama，访问Ollama官方网站：https://ollama.com/。
2. 下载要使用的语言模型。（在终端上运行下表Download列的命令）
    
    ![https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot 2024-03-09 at 19.31.22.png](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250104001833151.png?imageSlim)
    
3. 使用Ollama API加载语言模型。
4. 调用语言模型API进行预测。

### Ollama支持模型

> 以下这些模型都可以下载，复制“下载命令”到终端里运行即可

官方模型列表：https://ollama.com/library

| 模型 | 参数 | 大小 | 下载命令 | 更新日期 |
| --- | --- | --- | --- | --- |
| Qwen2 | 7B | 4.4GB | `ollama run qwen2:7b` | 2024/06/07 |
| codestral | 22B | 12 GB | `ollama run codestral` | 2024/06/05 |
| Mistral:v0.3 | 7B | 4.1GB | `ollama run mistral:v0.3` | 2024/06/05 |
| Yi:9b | 9B | 5.0GB | `ollama run yi:9b` | 2024/06/05 |
| Llama 3.1 | 8B | 4.7GB | `ollama run llama3.1` | 2024/07/25 |
| Llama 3.1 | 70B | 40GB | `ollama run llama3.1:70b`  | 2024/07/25 |
| Llama 3.1 | 405B | 231GB | `ollama run llama3.1:405b` | 2024/07/25 |
| Phi 3 Mini | 3.8B | 2.3GB | `ollama run phi3` | 2024/06/28 |
| Phi 3 Medium | 14B | 7.9GB | `ollama run phi3:medium` | 2024/06/28 |
| Gemma 2 | 9B | 5.5GB | `ollama run gemma2` | 2024/06/28 |
| Gemma 2 | 27B | 16GB | `ollama run gemma2:27b` | 2024/06/28 |
| Mistral | 7B | 4.1GB | `ollama run mistral` | 2024/04/25 |
| Moondream 2 | 1.4B | 829MB | `ollama run moondream` | 2024/06/28 |
| Neural Chat | 7B | 4.1GB | `ollama run neural-chat` | 2024/04/25 |
| Starling | 7B | 4.1GB | `ollama run starling-lm` | 2024/04/25 |
| Code Llama | 7B | 3.8GB | `ollama run codellama` | 2024/04/25 |
| Llama 2 Uncensored | 7B | 3.8GB | `ollama run llama2-uncensored` | 2024/04/25 |
| LLaVA | 7B | 4.5GB | `ollama run llava` | 2024/04/25 |
| Solar | 10.7B | 6.1GB | `ollama run solar` | 2024/04/25 |

如果要删除,复制下面的命令，将"llama2"替换为需要删除的模型即可

```jsx
ollama rm llama2
```

### 个人推荐模型

> 2024/06/07更新

- Qwen2（7B）
    
    当前本地最好的模型，在实际使用体验中，翻译、日常对话等使用场景，比Llama 3的体验要好
    
    Qwen2 是阿里云自主研发的超大规模预训练语言模型，能够处理多种自然语言任务，包括但不限于文本生成、翻译、问答等。它的能力体现在理解复杂的语境以及生成高质量、多样化的响应，适用于诸如对话系统、文本创作、智能客服等多种场景。
    
- Mistral:v0.3（日常对话）
    
    更新了v0.3版本
    
    Mistral-7B-v0.3 是由 Mistral AI 团队开发的大型语言模型（LLM），是 Mistral-7B-v0.2 的升级版。该模型在多个方面进行了改进和增强。通过扩展词汇表、改进分词器支持以及引入函数调用的一系列战略改进，展示了令人鼓舞的结果。
    

### 寻找更多模型

> 2024/04/28 更新

💡 Artificial Analysis

更新吴恩达老师推荐的评分网站！

[Model & API Providers Analysis | Artificial Analysis](https://artificialanalysis.ai/)


💡 林哥的大模型野榜

一个更适合中国宝宝体质的大模型产品的排行榜

[林哥的大模型野榜](https://lyihub.com/)


💡 Open LLM Leaderboard

Hugging Face是开源模型流行的社区，这是由他们官方维护的排行榜数据。

[Open LLM Leaderboard - a Hugging Face Space by HuggingFaceH4](https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard)


💡 SuperCLUE总排行榜

SuperCLUE 是一个中文通用大模型综合性评测基准，从三个不同的维度评价模型的能力：基础能力、专业能力和中文特性能力。

[SuperCLUE](https://www.superclueai.com/)


💡 MMLU 大规模多任务语言理解基准

MMLU 全称 Massive Multitask Language Understanding，是一种针对大模型的语言理解能力的测评，是目前最著名的大模型语义理解测评之一，由UC Berkeley大学的研究人员

[Papers with Code - MMLU Benchmark (Multi-task Language Understanding)](https://paperswithcode.com/sota/multi-task-language-understanding-on-mmlu)


💡 LLMEval

LLMEval是由复旦大学NLP实验室推出的大模型评测基准，最新的LLMEval-3聚焦于专业知识能力评测，涵盖哲学、经济学、法学、教育学、文学、历史学、
理学、工学、农学、医学、军事学、管理学、艺术学等教育部划定的13个学科门类、50余个二级学科，共计约20W道标准生成式问答题目。

[LLM-EVAL](http://llmeval.com/index)

### 简单测试

对话效果对比：

![https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot 2024-03-09 at 20.03.28.png](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250104002031815.png?imageSlim)

## 支持的客户端

### Cherry Studio

一个更现代的LLM客户端，支持国内和海外的各大服务商，界面流畅，整合了翻译、画图、智能体商店等服务。

Github地址：

https://github.com/kangfenmao/cherry-studio

![https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-11-01%20at%2015.35.38@2x.png](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250104002108886.png?imageSlim)

### Opencat

在 2.8 版本里加入对本地的模型的支持

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250104002213532.png?imageSlim)

前往设置里配置URL [http://localhost:11434](http://localhost:11434/)

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250104002250447.png?imageSlim)

显示验证成功即可

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250104002316462.png?imageSlim)

在对话界面上点击头像选择模型即可：

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250104002338271.png?imageSlim)

### NotesOllama

让你苹果备忘录可以使用Ollama的本地LLM进行交流。

https://github.com/andersrex/notesollama

选择笔记本中要交互的文本，在笔记的右下角会出现交互的菜单

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250104002417153.png?imageSlim)

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250104002440416.png?imageSlim)

### Lobe Chat

https://github.com/lobehub/lobe-chat

这是一款跨平台的客户端，支持多语言、插件系统、自部署。

在新版本里，已经支持Ollama的本地调用，以下是教程网页：

[在 LobeChat 中使用 Ollama · LobeChat Docs · LobeHub](https://lobehub.com/zh/docs/usage/providers/ollama)

界面UI预览：

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250104002510891.png?imageSlim)

### BMO Chatbot

> Obsidian的AI插件，使用 Ollama、LM Studio、Anthropic、Google Gemini、Mistral AI、OpenAI 等大型语言模型（LLM）为Obsidian生成和集思广益时，记录你的想法。
> 

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250104002535913.png?imageSlim)

Github地址：

https://github.com/longy2k/obsidian-bmo-chatbot

也可以在Obsidian的插件商店里搜索安装

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250104002557076.png?imageSlim)

> 💡 感谢您的观看！欢迎分享文章，或是来信与我交流。

> 本站 RSS地址已更新，麻烦读者朋友们重新订阅一次喔！