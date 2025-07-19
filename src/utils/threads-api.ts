import { threadsConfig } from '../config';

// Threads 帖子数据类型
export interface ThreadsPost {
  id: string;
  content: string;
  displayDate: Date;
  likes: number;
  replies: number;
  reposts: number;
  type: 'threads-post';
  images?: string[];
  author?: {
    name: string;
    username: string;
    avatar?: string;
  };
  url?: string;
}

// 缓存接口
interface CacheEntry {
  data: ThreadsPost[];
  timestamp: number;
}

// 内存缓存
let cache: CacheEntry | null = null;

// 检查缓存是否有效
function isCacheValid(): boolean {
  if (!cache) return false;
  const now = Date.now();
  const cacheAge = now - cache.timestamp;
  const maxAge = (threadsConfig.cacheTime || 30) * 60 * 1000; // 转换为毫秒
  return cacheAge < maxAge;
}

// 清除缓存
export function clearThreadsCache(): void {
  cache = null;
  console.log('Threads 缓存已清除');
}

// 模拟 Threads 数据
export function getMockThreadsPosts(): ThreadsPost[] {
  return [
    {
      id: '1',
      content: '今天的阅读笔记：《思考，快与慢》中提到的系统1和系统2思维模式，让我重新审视了自己的决策过程。快思维虽然高效，但慢思维的深度分析同样重要。 #阅读笔记 #思考',
      displayDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
      likes: 15,
      replies: 3,
      reposts: 2,
      type: 'threads-post',
      author: {
        name: 'CHACAT',
        username: 'chacat68',
        avatar: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250330115218086.png?imageSlim'
      },
      url: 'https://www.threads.com/@chacat68/post/mock1'
    },
    {
      id: '2',
      content: '刚完成了一次10公里的晨跑，感觉整个人都充满了活力！运动真的是最好的充电方式。今天的目标：专注写作，完成那篇关于时间管理的文章。 🏃‍♂️✍️',
      displayDate: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6小时前
      likes: 28,
      replies: 7,
      reposts: 5,
      type: 'threads-post',
      author: {
        name: 'CHACAT',
        username: 'chacat68',
        avatar: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250330115218086.png?imageSlim'
      },
      url: 'https://www.threads.com/@chacat68/post/mock2'
    },
    {
      id: '3',
      content: '分享一个有趣的发现：当我们专注于创作时，时间似乎过得特别快。这种"心流"状态让人着迷，也让我明白了为什么要选择自己真正热爱的事情。',
      displayDate: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12小时前
      likes: 42,
      replies: 12,
      reposts: 8,
      type: 'threads-post',
      author: {
        name: 'CHACAT',
        username: 'chacat68',
        avatar: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250330115218086.png?imageSlim'
      },
      url: 'https://www.threads.com/@chacat68/post/mock3'
    },
    {
      id: '4',
      content: '今天在咖啡店里偶遇了一位正在阅读《百年孤独》的朋友，我们聊了很久关于魔幻现实主义的话题。有时候，最好的对话就是这样不期而遇的。 ☕📚',
      displayDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前
      likes: 35,
      replies: 9,
      reposts: 4,
      type: 'threads-post',
      author: {
        name: 'CHACAT',
        username: 'chacat68',
        avatar: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250330115218086.png?imageSlim'
      },
      url: 'https://www.threads.com/@chacat68/post/mock4'
    },
    {
      id: '5',
      content: '正在重新整理我的数字工作流程。发现简化工具链比添加更多工具更有效果。有时候，少即是多。 #效率 #工具',
      displayDate: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5天前
      likes: 23,
      replies: 6,
      reposts: 3,
      type: 'threads-post',
      author: {
        name: 'CHACAT',
        username: 'chacat68',
        avatar: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250330115218086.png?imageSlim'
      },
      url: 'https://www.threads.com/@chacat68/post/mock5'
    }
  ];
}

// 从 Threads API 获取帖子
async function fetchPostsFromAPI(): Promise<ThreadsPost[]> {
  if (!threadsConfig.enable || !threadsConfig.accessToken) {
    console.log('Threads API 未启用或缺少访问令牌，使用模拟数据');
    return getMockThreadsPosts();
  }

  try {
    // 构建 API 请求 URL
    const apiUrl = 'https://graph.threads.net/v1.0/me/threads';
    const params = new URLSearchParams({
      fields: 'id,media_type,media_url,permalink,text,timestamp,username,children{media_url,media_type}',
      limit: (threadsConfig.maxPosts || 10).toString(),
      access_token: threadsConfig.accessToken
    });

    console.log('正在从 Threads API 获取帖子...');
    const response = await fetch(`${apiUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Threads API 请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Threads API 错误: ${data.error.message}`);
    }

    // 定义 Threads API 响应类型
    interface ThreadsApiPost {
      id: string;
      text?: string;
      timestamp: string;
      username?: string;
      permalink?: string;
      children?: ThreadsApiChild[];
    }

    interface ThreadsApiChild {
      media_type: string;
      media_url: string;
    }

    interface ThreadsApiResponse {
      data?: ThreadsApiPost[];
      error?: {
        message: string;
      };
    }

    // 转换 API 响应为我们的数据格式
    const posts: ThreadsPost[] = (data as ThreadsApiResponse).data?.map((post: ThreadsApiPost) => ({
      id: post.id,
      content: post.text || '',
      displayDate: new Date(post.timestamp),
      likes: 0, // Threads API 不直接提供点赞数
      replies: 0, // Threads API 不直接提供回复数
      reposts: 0, // Threads API 不直接提供转发数
      type: 'threads-post' as const,
      images: post.children?.filter((child: ThreadsApiChild) => child.media_type === 'IMAGE').map((child: ThreadsApiChild) => child.media_url) || [],
      author: {
        name: threadsConfig.username || 'Unknown',
        username: post.username || threadsConfig.username || 'unknown',
      },
      url: post.permalink
    })) || [];

    console.log(`成功获取 ${posts.length} 条 Threads 帖子`);
    return posts;

  } catch (error) {
    console.error('Threads API 调用失败:', error);
    
    if (threadsConfig.fallbackToMock) {
      console.log('回退到模拟数据');
      return getMockThreadsPosts();
    }
    
    throw error;
  }
}

// 获取 Threads 帖子（带缓存）
export async function getThreadsPosts(): Promise<ThreadsPost[]> {
  // 检查缓存
  if (isCacheValid() && cache) {
    console.log('使用缓存的 Threads 帖子数据');
    return cache.data;
  }

  try {
    // 从 API 获取新数据
    const posts = await fetchPostsFromAPI();
    
    // 更新缓存
    cache = {
      data: posts,
      timestamp: Date.now()
    };
    
    return posts;
  } catch (error) {
    console.error('获取 Threads 帖子失败:', error);
    
    // 如果有旧缓存，使用旧缓存
    if (cache) {
      console.log('使用过期的缓存数据');
      return cache.data;
    }
    
    // 最后的回退选项
    if (threadsConfig.fallbackToMock) {
      console.log('使用模拟数据作为最后的回退选项');
      return getMockThreadsPosts();
    }
    
    throw error;
  }
}