import { xTwitterConfig } from '../config';

// X平台推文数据类型
export interface XTweet {
  id: string;
  content: string;
  displayDate: Date;
  likes: number;
  replies: number;
  retweets: number;
  type: 'x-tweet';
  images?: string[];
  author?: {
    name: string;
    username: string;
    avatar?: string;
  };
}

// 模拟推文数据（作为备用方案）
const mockTweets: XTweet[] = [
  {
    id: 'tweet1',
    content: '刚刚完成了一个有趣的项目，使用Astro构建静态网站真的很棒！🚀 #WebDev #Astro',
    displayDate: new Date('2024-12-20'),
    likes: 42,
    replies: 5,
    retweets: 8,
    type: 'x-tweet',
    images: ['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=300&fit=crop']
  },
  {
    id: 'tweet2', 
    content: '今天学习了一些新的CSS技巧，响应式设计真的是一门艺术 ✨',
    displayDate: new Date('2024-12-19'),
    likes: 28,
    replies: 2,
    retweets: 3,
    type: 'x-tweet'
  },
  {
    id: 'tweet3',
    content: '分享一个开发小技巧：使用TypeScript可以大大提高代码质量和开发效率 💡',
    displayDate: new Date('2024-12-18'),
    likes: 67,
    replies: 8,
    retweets: 15,
    type: 'x-tweet',
    images: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop'
    ]
  }
];

// 缓存管理
interface CacheEntry {
  data: XTweet[];
  timestamp: number;
}

let cache: CacheEntry | null = null;

// 检查缓存是否有效
function isCacheValid(): boolean {
  if (!cache) return false;
  const now = Date.now();
  const cacheAge = (now - cache.timestamp) / (1000 * 60); // 转换为分钟
  return cacheAge < (xTwitterConfig.cacheTime || 30);
}

// 从X平台API获取推文
async function fetchTweetsFromAPI(): Promise<XTweet[]> {
  if (!xTwitterConfig.enable) {
    console.log('X平台API未启用，使用模拟数据');
    return mockTweets;
  }

  if (!xTwitterConfig.bearerToken && !xTwitterConfig.apiKey) {
    console.warn('X平台API密钥未配置，使用模拟数据');
    return mockTweets;
  }

  try {
    // 这里是X平台API v2的示例调用
    // 注意：由于CORS限制，在客户端直接调用可能会失败
    // 建议在服务端API路由中实现
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (xTwitterConfig.bearerToken) {
      headers['Authorization'] = `Bearer ${xTwitterConfig.bearerToken}`;
    }

    const username = xTwitterConfig.username || 'Chacat68';
    const maxResults = Math.min(xTwitterConfig.maxTweets || 10, 100);
    
    // X API v2 用户推文端点
    const url = `https://api.twitter.com/2/users/by/username/${username}`;
    const userResponse = await fetch(url, { headers });
    
    if (!userResponse.ok) {
      throw new Error(`获取用户信息失败: ${userResponse.status}`);
    }
    
    const userData = await userResponse.json();
    const userId = userData.data?.id;
    
    if (!userId) {
      throw new Error('无法获取用户ID');
    }

    // 获取用户推文
    const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics,attachments&expansions=attachments.media_keys&media.fields=url,preview_image_url`;
    const tweetsResponse = await fetch(tweetsUrl, { headers });
    
    if (!tweetsResponse.ok) {
      throw new Error(`获取推文失败: ${tweetsResponse.status}`);
    }
    
    const tweetsData = await tweetsResponse.json();
    
    // 转换API数据为内部格式
    const tweets: XTweet[] = tweetsData.data?.map((tweet: any) => {
      const media = tweetsData.includes?.media || [];
      const tweetMedia = media.filter((m: any) => 
        tweet.attachments?.media_keys?.includes(m.media_key)
      );
      
      return {
        id: tweet.id,
        content: tweet.text,
        displayDate: new Date(tweet.created_at),
        likes: tweet.public_metrics?.like_count || 0,
        replies: tweet.public_metrics?.reply_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        type: 'x-tweet' as const,
        images: tweetMedia.map((m: any) => m.url || m.preview_image_url).filter(Boolean),
        author: {
          name: userData.data?.name || '',
          username: userData.data?.username || '',
        }
      };
    }) || [];
    
    console.log(`成功获取 ${tweets.length} 条推文`);
    return tweets;
    
  } catch (error) {
    console.error('获取X平台推文失败:', error);
    
    if (xTwitterConfig.fallbackToMock) {
      console.log('回退到模拟数据');
      return mockTweets;
    }
    
    return [];
  }
}

// 获取X平台推文（带缓存）
export async function getXTweets(): Promise<XTweet[]> {
  // 检查缓存
  if (isCacheValid() && cache) {
    console.log('使用缓存的推文数据');
    return cache.data;
  }

  // 获取新数据
  const tweets = await fetchTweetsFromAPI();
  
  // 更新缓存
  cache = {
    data: tweets,
    timestamp: Date.now()
  };
  
  return tweets;
}

// 清除缓存（用于强制刷新）
export function clearXTweetsCache(): void {
  cache = null;
  console.log('X平台推文缓存已清除');
}

// 获取模拟数据（用于开发和测试）
export function getMockXTweets(): XTweet[] {
  return mockTweets;
}