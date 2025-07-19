// X平台推文API路由
// 解决CORS限制，在服务端调用X API

import type { APIRoute } from 'astro';
import { xTwitterConfig } from '../../config';
import type { XTweet } from '../../utils/x-twitter-api';

// 不再提供模拟推文数据

// 从X平台API获取推文
async function fetchTweetsFromAPI(): Promise<XTweet[]> {
  if (!xTwitterConfig.enable) {
    console.log('X平台API未启用，返回空数组');
    return [];
  }

  if (!xTwitterConfig.bearerToken && !xTwitterConfig.apiKey) {
    console.warn('X平台API密钥未配置，返回空数组');
    return [];
  }

  try {
    // 构建请求头
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
      throw new Error(`获取用户信息失败: ${userResponse.status} ${userResponse.statusText}`);
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
      throw new Error(`获取推文失败: ${tweetsResponse.status} ${tweetsResponse.statusText}`);
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
    
    return [];
  }
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const tweets = await fetchTweetsFromAPI();
    
    return new Response(JSON.stringify({
      success: true,
      data: tweets,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `max-age=${(xTwitterConfig.cacheTime || 30) * 60}` // 缓存时间转换为秒
      }
    });
  } catch (error) {
    console.error('API路由错误:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      data: []
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};