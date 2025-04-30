import {Streamer,ApiResponse} from "../../common/types.ts";
import puppeteer from 'puppeteer';
import axios from "axios";
import * as cheerio from 'cheerio';
export async function isHuyaLiving(streamer: Streamer): Promise<boolean> {
    const url = `https://www.huya.com/${streamer.roomId}`
    try {
        const response = await axios.get(url, {
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0"
            }
        });
        // 使用 cheerio 加载 HTML 内容
        const $ = cheerio.load(response.data);

        // 查找包含 TT_ROOM_DATA 的 script 标签
        let isOn = null;
        $('script').each((i, elem) => {
            const scriptContent = $(elem).html();
            if (scriptContent.includes('TT_ROOM_DATA')) {
                // 使用正则表达式提取 TT_ROOM_DATA 对象
                const match = scriptContent.match(/var TT_ROOM_DATA = ({[\s\S]*?});/);
                if (match && match[1]) {
                    try {
                        // 解析 TT_ROOM_DATA 对象
                        const roomData = eval(`(${match[1]})`);
                        isOn = roomData.isOn;
                    } catch (e) {
                        console.error('Error parsing TT_ROOM_DATA:', e);
                    }
                }
            }
        });
        return isOn !== null && isOn === 'true';
    } catch (e) {
        console.error('bilibili error', e)
        return streamer.isLive;
    }
}

export async function getHuyaFollowList(cookies: string): Promise<ApiResponse<Streamer[]>> {
    console.log('开始获取虎牙关注列表(非缓存)...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    // 设置Cookies
    const cookieArray = cookies.split(';').map(cookie => {
        const [name, value] = cookie.trim().split('=');
        return { name, value, domain: '.huya.com', path: '/' };
    });
    await page.setCookie(...cookieArray);

    // 访问虎牙关注页面
    await page.goto('https://www.huya.com/myfollow', { waitUntil: 'networkidle2' });

    const followList: Streamer[] = await page.evaluate(() => {
        const list = Array.from(document.querySelectorAll('.subscribe-live-item')).map(item => {
            // 获取主播ID和房间ID
            const roomUrl = item.querySelector('.video-info')?.getAttribute('href') || '';
            const roomId = roomUrl.split('/').pop() || '';
            
            // 获取主播名称
            const name = item.querySelector('.nick')?.textContent?.trim() || '';
            
            // 获取直播状态
            const isLiveTag = item.querySelector('.tag-living');
            const isReplayTag = item.querySelector('.tag-replay');
            const isLive = !!isLiveTag;
            
            // 获取头像
            const avatarElement = item.querySelector('.avatar img');
            const avatar = avatarElement?.getAttribute('src') || '';
            
            // 获取直播标题
            const title = item.querySelector('.intro')?.textContent?.trim() || '';
            
            // 获取观看人数
            const viewerCountElement = item.querySelector('.num');
            let viewerCountText = viewerCountElement?.textContent?.trim() || '0';
            
            // 解析观看人数
            const parseViewerCount = (text: string): number => {
                if (!text) return 0;
                text = text.replace(/,/g, '');
                if (text.includes('万')) {
                    return parseFloat(text.replace('万', '')) * 10000;
                }
                return parseInt(text, 10) || 0;
            };
            
            // 获取直播间ID
            const dataLp = item.getAttribute('data-lp') || '';
            
            return {
                id: dataLp,
                platform: 'huya' as const,
                name: name,
                avatar: avatar,
                isLive: isLive,
                roomId: roomId,
                roomUrl: roomUrl,
                title: title,
                viewerCount: parseViewerCount(viewerCountText),
                // 其他可选字段可能需要额外处理
            };
        });
        return list;
    });

    await browser.close();

    return {data:followList, success:true};
}