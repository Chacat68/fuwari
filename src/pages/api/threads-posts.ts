// Threads 帖子 API 路由
// 解决 CORS 限制，在服务端调用 Threads API

import type { APIRoute } from 'astro';
import { threadsConfig } from '../../config';
import { getThreadsPosts, getMockThreadsPosts } from '../../utils/threads-api';

// 处理 GET 请求
export const GET: APIRoute = async () => {
  try {
    // 检查是否启用 Threads 集成
    if (!threadsConfig.enable) {
      console.log('Threads 集成未启用，返回模拟数据');
      const mockPosts = getMockThreadsPosts();
      return new Response(JSON.stringify({
        success: true,
        data: mockPosts,
        source: 'mock',
        message: 'Threads 集成未启用，使用模拟数据'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // 缓存5分钟
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // 获取 Threads 帖子
    const posts = await getThreadsPosts();
    
    return new Response(JSON.stringify({
      success: true,
      data: posts,
      source: threadsConfig.accessToken ? 'api' : 'mock',
      count: posts.length,
      cached: true, // 这个值会在实际实现中根据缓存状态动态设置
      message: `成功获取 ${posts.length} 条 Threads 帖子`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 缓存5分钟
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Threads API 路由错误:', error);
    
    // 错误时返回模拟数据
    const mockPosts = getMockThreadsPosts();
    
    return new Response(JSON.stringify({
      success: false,
      data: mockPosts,
      source: 'mock',
      error: error instanceof Error ? error.message : '未知错误',
      message: 'API 调用失败，返回模拟数据'
    }), {
      status: 200, // 仍然返回 200，因为我们提供了回退数据
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // 错误时缓存时间更短
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
};

// 处理 OPTIONS 请求（CORS 预检）
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400' // 24小时
    }
  });
};

// 处理 POST 请求（清除缓存）
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    if (body.action === 'clear-cache') {
      const { clearThreadsCache } = await import('../../utils/threads-api');
      clearThreadsCache();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Threads 缓存已清除'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    return new Response(JSON.stringify({
      success: false,
      message: '不支持的操作'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};