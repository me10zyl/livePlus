// 斗鱼关注列表
import axios from "axios";
import {ApiResponse, Streamer} from "../../common/types";

export async function isDouyuLiving(streamer: Streamer): Promise<boolean> {
    try {
        const url = `https://www.douyu.com/betard/${streamer.id}`
        const response = await axios.get(url, {
            headers: {
                "user-agent": " Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0",
                "referrer": `https://www.douyu.com/${streamer.id}`
            }
        })
        return response.data.room.show_status === 1
    }catch (e){
        console.error('douyu error', e)
        return streamer.isLive;
    }
}


export async function getDouyuFollowList(cookies: string): Promise<ApiResponse<Streamer[]>> {
    console.log('开始获取斗鱼关注列表(非缓存)...');
    const response = await axios.get('https://www.douyu.com/wgapi/livenc/liveweb/follow/list?sort=0&cid1=0', {
        headers: {
            Cookie: cookies,
            "user-agent" : " Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0",
            "referrer" : "https://www.douyu.com/directory/myFollow"
        },
    });
    // 假设API返回JSON格式的关注主播列表
    let data = response.data;
    if(data.error != 0){
        console.log('获取斗鱼关注列表失败:', data);
        return {data: [], success:false, error:data.msg};
    }
    
    // 将API返回的数据转换为Streamer类型的数组
    const streamers: Streamer[] = data.data.list.map((item: any) => {
        return {
            id: item.room_id.toString(),
            platform: 'douyu',
            name: item.nickname,
            avatar: item.avatar_small,
            isLive: item.show_status === 1,
            roomId: item.room_id.toString(),
            roomUrl: `https://www.douyu.com${item.url}`,
            title: item.room_name,
            category: item.game_name,
            viewerCount: parseViewerCount(item.online),
            startTime: item.show_time ? new Date(item.show_time * 1000).toISOString() : undefined,
        };
    });
    
    return {data:streamers, success:true};
}

// 辅助函数：将斗鱼的观看人数字符串转换为数字
function parseViewerCount(viewerStr: string): number {
    if (!viewerStr) return 0;
    
    if (viewerStr.includes('万')) {
        return parseFloat(viewerStr.replace('万', '')) * 10000;
    }
    
    return parseInt(viewerStr, 10) || 0;
}