import { ApiResponse, PlatformType,Streamer } from "../../common/types";
import {getDouyuFollowList} from "./douyu";
import {getBilibiliFollowList} from "./bilibili";
import {getHuyaFollowList} from "./huya";
import {getDouyinFollowList} from './douyin'
import Store from 'electron-store';

const store = new Store();


export async function getFollowingList( platform:PlatformType, forceRefresh = false): Promise<ApiResponse<Streamer[]>> {
// 如果不强制刷新，先尝试从缓存获取
if (!forceRefresh) {
    const cachedList = store.get(`followingList.${platform}`, null);
    if (cachedList) {
      console.log(`使用${platform}缓存数据`);
      return {data: cachedList as Streamer[], success : true};
    }
  }
  
  const cookies = store.get(`cookies.${platform}`, '') as string
  if(!cookies){
    return {error: '未设置Cookie', 'success' : false}
  }
  try {
    let result: ApiResponse<Streamer[]>;
    switch (platform) {
      case 'douyin':
        result = await getDouyinFollowList(cookies);
        break;
      case 'douyu':
        result = await getDouyuFollowList(cookies);
        break;
      case 'bilibili':
        result = await getBilibiliFollowList(cookies);
        break;
      case 'huya':
        result = await getHuyaFollowList(cookies);
        break;
      default:
        throw new Error('不支持的平台');
    }
    
    // 将结果保存到缓存
    if (result.success && result.data && result.data.length > 0) {
      store.set(`followingList.${platform}`, result.data);
    }
    
    return result;
  } catch (error) {
    console.error(`获取${platform}关注列表失败:`, error);
    return { error: '获取关注列表失败:' + error , success: false};
  }
}