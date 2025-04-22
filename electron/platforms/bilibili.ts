import {Streamer} from "../../common/types.ts";
import axios from "axios";

export async function getBilibiliFollowList(cookies: string): Promise<Streamer[]> {
    let allStreamers: Streamer[] = [];
    let currentPage = 1;
    let totalPage = 1;
    
    // 迭代获取所有分页数据
    do {
        const response = await axios.get(`https://api.live.bilibili.com/xlive/web-ucenter/user/following?page=${currentPage}&page_size=9&ignoreRecord=1&hit_ab=true`, {
            headers: {
                Cookie: cookies,
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0",
                "referrer": "https://link.bilibili.com/p/center/index"
            },
        });
        
        let data = response.data;
        
        if (data.code !== 0) {
            return [];
        }
        
        // 获取总页数
        totalPage = data.data.totalPage;
        
        // 将当前页的数据转换为Streamer类型并添加到结果数组
        const pageStreamers = data.data.list.map((item: any) => {
            return {
                id: item.uid.toString(),
                platform: 'bilibili',
                name: item.uname,
                avatar: item.face,
                isLive: item.live_status === 1,
                roomId: item.roomid.toString(),
                roomUrl: `https://live.bilibili.com/${item.roomid}`,
                title: item.title,
                category: item.area_name_v2,
                viewerCount: parseViewerCount(item.text_small),
                startTime: item.record_live_time ? new Date(item.record_live_time * 1000).toISOString() : undefined,
                description: item.room_news
            };
        });
        
        allStreamers = [...allStreamers, ...pageStreamers];
        currentPage++;
        
    } while (currentPage <= totalPage);
    
    return allStreamers;
}

// 辅助函数：将B站的观看人数字符串转换为数字
function parseViewerCount(viewerStr: string): number {
    if (!viewerStr) return 0;
    
    if (viewerStr.includes('万')) {
        return parseFloat(viewerStr.replace('万', '')) * 10000;
    }
    
    return parseInt(viewerStr.replace(/,/g, ''), 10) || 0;
}