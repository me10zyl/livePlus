import puppeteer from 'puppeteer';
import { Streamer } from "../../common/types";

export async function getDouyinFollowList(cookies: string): Promise<Streamer[]> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // 清理和解析Cookies
    const cookieArray = cookies
        .split(';')
        .map((cookie) => cookie.trim())
        .filter((cookie) => cookie && cookie.includes('=') && cookie.split('=')[1] !== '') // 过滤空值和无效格式
        .map((cookie) => {
            const [name, ...valueParts] = cookie.split('='); // 处理value中包含'='的情况
            const value = valueParts.join('='); // 重新拼接value
            if (!name || !value) {
                console.warn(`无效Cookie: ${cookie}`);
                return null;
            }
            return { name: name.trim(), value: value.trim(), domain: '.douyin.com', path: '/' };
        })
        .filter((cookie): cookie is { name: string; value: string; domain: string; path: string } => cookie !== null);

    if (cookieArray.length === 0) {
        console.error('没有有效的Cookies');
        return [];
    }
    await page.setCookie(...cookieArray);

    // 创建一个标志，用于跟踪是否已经处理过响应
    let responseProcessed = false;
    
    // 创建一个Promise，用于等待API响应
    const responsePromise = new Promise<Streamer[]>((resolve) => {
        // 设置超时，如果在指定时间内没有收到响应，则返回空数组
        const timeoutId = setTimeout(() => {
            if (!responseProcessed) {
                console.log('抖音API响应超时，返回空数组');
                responseProcessed = true;
                resolve([]);
            }
        }, 10000); // 增加超时时间到10秒
        
        // 监听网络响应
        page.on('response', async (response) => {
            const url = response.url();
            
            // 只处理目标API的响应
            if (url.includes('webcast/web/feed/follow') && !responseProcessed) {
                try {
                    // 尝试解析响应数据
                    const responseData = await response.json().catch(() => null);
                    console.log('收到抖音API响应');
                    
                    if (responseData && responseData.data && Array.isArray(responseData.data.data)) {
                        // 标记为已处理
                        responseProcessed = true;
                        // 清除超时
                        clearTimeout(timeoutId);
                        
                        // 解析数据并解析Promise
                        const streamers = responseData.data.data.map((item: any) => {
                            const room = item.room || {};
                            const owner = item.owner || room.owner || {};
                            
                            // 获取头像URL
                            const avatarUrl = owner.avatar_thumb?.url_list?.[0] || '';
                            
                            return {
                                id: owner.id_str || '',
                                platform: 'douyin',
                                name: owner.nickname || '',
                                avatar: avatarUrl,
                                isLive: room.status === 0,
                                roomId: room.id_str || '',
                                roomUrl: `https://www.douyin.com/live/${room.id_str || ''}`,
                                title: room.title || '',
                                category: room.category_name || '',
                                viewerCount: parseInt(room.user_count_str || '0', 10),
                                startTime: room.create_time ? new Date(room.create_time * 1000).toISOString() : undefined,
                                description: room.description || '',
                            };
                        });
                        
                        console.log('成功解析抖音直播数据，共', streamers.length, '条');
                        resolve(streamers);
                    }
                } catch (err) {
                    console.warn(`解析抖音API响应失败:`, err);
                }
            }
        });
    });

    // 启用请求拦截
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.continue();
    });
    
    // 访问抖音关注页面
    console.log('正在访问抖音关注页面...');
    await page.goto('https://www.douyin.com/follow', { waitUntil: 'networkidle2' });
    
    // 等待API响应处理完成
    console.log('等待抖音API响应...');
    const streamers = await responsePromise;
    
    // 关闭浏览器
    await browser.close();
    console.log('抖音关注列表获取完成，共', streamers.length, '个主播');
    return streamers;
}