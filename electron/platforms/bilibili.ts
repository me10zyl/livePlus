import {Streamer, ApiResponse} from "../../common/types.ts";
import axios from "axios";
//{
//     "code": 0,
//     "message": "0",
//     "ttl": 1,
//     "data": {
//         "by_uids": {},
//         "by_room_ids": {
//             "5050": {
//                 "room_id": 5050,
//                 "uid": 433351,
//                 "area_id": 236,
//                 "live_status": 1,
//                 "live_url": "https://live.bilibili.com/5050",
//                 "parent_area_id": 6,
//                 "title": "暗区",
//                 "parent_area_name": "单机游戏",
//                 "area_name": "主机游戏",
//                 "live_time": "2025-04-30 13:31:31",
//                 "description": "\u003cp\u003e \u003c/p\u003e",
//                 "tags": "老E,主机游戏,单机游戏",
//                 "attention": 3222453,
//                 "online": 952568,
//                 "short_id": 0,
//                 "uname": "EdmundDZhang",
//                 "cover": "https://i0.hdslb.com/bfs/live/new_room_cover/e692668c4183162994d489e93707beef7afe3c91.jpg",
//                 "background": "http://i0.hdslb.com/bfs/live/room_bg/cdfd9c09d7c87baa222bbe424ccb05296aad9550.jpg",
//                 "join_slide": 1,
//                 "live_id": 598268139511223226,
//                 "live_id_str": "598268139511223226",
//                 "lock_status": 0,
//                 "hidden_status": 0,
//                 "is_encrypted": false
//             }
//         }
//     }
// }
export async function isBilibiliLiving(streamer: Streamer): Promise<boolean> {
    const url = `https://api.live.bilibili.com/xlive/web-room/v1/index/getRoomBaseInfo?room_ids=${streamer.roomId}&req_biz=video`
    try {
        const response = await axios.get(url, {
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0"
            },
        });
        return response.data.data.by_room_ids[streamer.roomId].live_status === 1
    } catch (e) {
        console.error('bilibili error', e)
        return streamer.isLive;
    }
}

export async function getBilibiliFollowList(cookies: string): Promise<ApiResponse<Streamer[]>> {
    console.log('开始获取B站关注列表(非缓存)...');
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
            return {error: '获取bibibi关注者列表失败:' + JSON.stringify(data), success: false, data: []};
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

    return {data: allStreamers, success: true};
}

// 辅助函数：将B站的观看人数字符串转换为数字
function parseViewerCount(viewerStr: string): number {
    if (!viewerStr) return 0;

    if (viewerStr.includes('万')) {
        return parseFloat(viewerStr.replace('万', '')) * 10000;
    }

    return parseInt(viewerStr.replace(/,/g, ''), 10) || 0;
}