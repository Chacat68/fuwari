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

// 不再提供模拟推文数据

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

// 从服务端API获取推文（避免CORS问题）
async function fetchTweetsFromAPI(): Promise<XTweet[]> {
  try {
    // 调用服务端API路由
    const response = await fetch('/api/x-tweets');
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '获取推文失败');
    }
    
    // 转换日期字符串为Date对象
    const tweets: XTweet[] = result.data.map((tweet: any) => ({
      ...tweet,
      displayDate: new Date(tweet.displayDate)
    }));
    
    console.log(`成功获取 ${tweets.length} 条推文`);
    return tweets;
    
  } catch (error) {
    console.error('获取X平台推文失败:', error);
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

// 不再提供模拟数据功能