import axios from 'axios';
import puppeteer from 'puppeteer';
import { Streamer, PlatformType } from './types';

// 斗鱼API
export async function getDouyuFollowing(cookie: string): Promise<Streamer[]> {
  try {
    const response = await axios.get('https://www.douyu.com/wgapi/livenc/liveweb/follow/list', {
      params: {
        page: 1,
        limit: 100
      },
      headers: {
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36'
      }
    });

    if (response.data.error === 0 && response.data.data) {
      const list = response.data.data.list || [];
      return list.map((item: any) => ({
        id: item.room_id,
        platform: 'douyu' as PlatformType,
        name: item.nickname,
        avatar: item.avatar_small,
        isLive: item.show_status === 1,
        roomId: item.room_id,
        roomUrl: `https://www.douyu.com/${item.room_id}`,
        title: item.room_name,
        category: item.cate_name,
        viewerCount: item.online,
        startTime: item.show_time ? new Date(item.show_time * 1000).toISOString() : undefined
      }));
    }
    return [];
  } catch (error) {
    console.error('获取斗鱼关注列表失败', error);
    return [];
  }
}

// B站API
export async function getBilibiliFollowing(cookie: string): Promise<Streamer[]> {
  try {
    const response = await axios.get('https://api.live.bilibili.com/xlive/web-ucenter/user/following', {
      params: {
        page: 1,
        page_size: 100
      },
      headers: {
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36'
      }
    });

    if (response.data.code === 0 && response.data.data) {
      const list = response.data.data.list || [];
      return list.map((item: any) => ({
        id: item.uid,
        platform: 'bilibili' as PlatformType,
        name: item.uname,
        avatar: item.face,
        isLive: item.live_status === 1,
        roomId: item.roomid,
        roomUrl: `https://live.bilibili.com/${item.roomid}`,
        title: item.title,
        category: item.area_name,
        viewerCount: item.online,
        description: item.description
      }));
    }
    return [];
  } catch (error) {
    console.error('获取B站关注列表失败', error);
    return [];
  }
}

// 虎牙API
export async function getHuyaFollowing(cookie: string): Promise<Streamer[]> {
  try {
    const response = await axios.get('https://fw.huya.com/dispatch/getStreamListByMultiSubscribe', {
      headers: {
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36'
      }
    });

    if (response.data.result === 0 && response.data.data) {
      const list = response.data.data.dDataList || [];
      return list.map((item: any) => ({
        id: item.lProfileRoom,
        platform: 'huya' as PlatformType,
        name: item.sNick,
        avatar: item.sAvatar180,
        isLive: item.iGameLiveStatus === 1,
        roomId: item.lProfileRoom,
        roomUrl: `https://www.huya.com/${item.lProfileRoom}`,
        title: item.sRoomName,
        category: item.sGameFullName,
        viewerCount: item.lTotalCount
      }));
    }
    return [];
  } catch (error) {
    console.error('获取虎牙关注列表失败', error);
    return [];
  }
}

// 抖音API (需要使用puppeteer模拟浏览器)
export async function getDouyinFollowing(cookie: string): Promise<Streamer[]> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 设置cookie
    const cookies = cookie.split(';').map(pair => {
      const [name, value] = pair.trim().split('=');
      return { name, value, domain: '.douyin.com', path: '/' };
    });
    
    await page.setCookie(...cookies);
    
    // 访问抖音关注页面
    await page.goto('https://www.douyin.com/follow', { waitUntil: 'networkidle2' });
    
    // 等待内容加载
    await page.waitForSelector('.w6LJviG1', { timeout: 10000 });
    
    // 获取关注列表数据
    const result = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.w6LJviG1'));
      return items.map(item => {
        const nameElement = item.querySelector('.sFG6Qjn3');
        const avatarElement = item.querySelector('.eHI4euad img');
        const statusElement = item.querySelector('.rZ8J2XVX');
        const linkElement = item.querySelector('a.AJ6jtqlg');
        
        const name = nameElement ? nameElement.textContent?.trim() : '';
        const avatar = avatarElement ? avatarElement.getAttribute('src') : '';
        const isLive = statusElement ? statusElement.textContent?.includes('直播中') : false;
        const link = linkElement ? linkElement.getAttribute('href') : '';
        
        // 从链接中提取ID
        const idMatch = link ? link.match(/\/user\/([^?]+)/) : null;
        const id = idMatch ? idMatch[1] : '';
        
        return {
          id,
          name,
          avatar,
          isLive,
          link: link ? `https://www.douyin.com${link}` : ''
        };
      });
    });
    
    return result.map(item => ({
      id: item.id,
      platform: 'douyin' as PlatformType,
      name: item.name || '',
      avatar: item.avatar || '',
      isLive: item.isLive,
      roomId: item.id,
      roomUrl: item.link
    }));
  } catch (error) {
    console.error('获取抖音关注列表失败', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 统一平台API调用
export async function getFollowingList(platform: PlatformType, cookie: string): Promise<Streamer[]> {
  switch (platform) {
    case 'douyu':
      return getDouyuFollowing(cookie);
    case 'bilibili':
      return getBilibiliFollowing(cookie);
    case 'huya':
      return getHuyaFollowing(cookie);
    case 'douyin':
      return getDouyinFollowing(cookie);
    default:
      return [];
  }
} 