# Slow routes (Top 20)

| # | 耗时 | URL | 源文件 | 行数 | 大小 | 图片 | 图片格式(Top4) | 代码块行 | 表格行 |
|---:|---:|---|---|---:|---:|---:|---|---:|---:|
| 1 | 5.510s | /posts/diary1/index.html | src/content/posts/diary1.md | 45 | 2.4 KB | 6 | tif:6 | 0 | 0 |
| 2 | 4.840s | /posts/diary8/index.html | src/content/posts/diary8.md | 137 | 10.3 KB | 31 | jpg:24 png:7 | 0 | 0 |
| 3 | 3.640s | /posts/design8/index.html | src/content/posts/design8.md | 180 | 9.4 KB | 26 | png:26 | 0 | 2 |
| 4 | 2.090s | /posts/diary27/index.html | src/content/posts/diary27.md | 114 | 5.9 KB | 16 | png:16 | 0 | 0 |
| 5 | 1.910s | /posts/blog1/index.html | src/content/posts/blog1.md | 127 | 5.7 KB | 15 | png:15 | 0 | 0 |
| 6 | 1.770s | /posts/diary30/index.html | src/content/posts/diary30.md | 81 | 3.9 KB | 10 | png:10 | 0 | 0 |
| 7 | 1.570s | /posts/ai3/index.html | src/content/posts/ai3.md | 210 | 8.2 KB | 12 | png:12 | 2 | 22 |
| 8 | 1.490s | /posts/design10/index.html | src/content/posts/design10.md | 182 | 6.4 KB | 10 | png:10 | 0 | 0 |
| 9 | 1.420s | /posts/design7/index.html | src/content/posts/design7.md | 120 | 5.8 KB | 13 | png:13 | 0 | 0 |
| 10 | 1.340s | /posts/design2/index.html | src/content/posts/design2.md | 121 | 6.5 KB | 9 | jpg:9 | 0 | 0 |
| 11 | 1.330s | /posts/diary9/index.html | src/content/posts/diary9.md | 76 | 4.3 KB | 9 | png:9 | 0 | 0 |
| 12 | 1.320s | /posts/design9/index.html | src/content/posts/design9.md | 84 | 3.6 KB | 10 | png:10 | 0 | 0 |
| 13 | 1.030s | /about/index.html | src/pages/about.astro | - | - | - | - | - | - |
| 14 | 0.878s | /posts/diary31/index.html | src/content/posts/diary31.md | 69 | 4.0 KB | 7 | jpeg:7 | 0 | 0 |
| 15 | 0.871s | /posts/design1/index.html | src/content/posts/design1.md | 111 | 5.8 KB | 6 | png:4 jpeg:2 | 0 | 0 |
| 16 | 0.870s | /posts/diary10/index.html | src/content/posts/diary10.md | 60 | 3.4 KB | 6 | png:6 | 0 | 0 |
| 17 | 0.850s | /posts/design12/index.html | src/content/posts/design12.md | 134 | 7.4 KB | 6 | png:6 | 0 | 0 |
| 18 | 0.806s | /posts/diary18/index.html | src/content/posts/diary18.md | 60 | 2.6 KB | 7 | png:7 | 0 | 0 |
| 19 | 0.732s | /posts/ai1/index.html | src/content/posts/ai1.md | 164 | 9.6 KB | 5 | png:5 | 0 | 2 |
| 20 | 0.697s | /posts/design3/index.html | src/content/posts/design3.md | 68 | 4.7 KB | 5 | png:5 | 0 | 0 |

## 观察

- 目前最慢的几篇里，图片数量明显更高（例如 diary8: 31 张）。
- diary1 的图片格式里包含 tif（Sharp 解码/处理通常更慢）；如果这些图片参与了构建期处理，这是最优先的可疑点。