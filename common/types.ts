// 平台类型
export type PlatformType = 'douyu' | 'bilibili' | 'huya' | 'douyin';

// 主播信息接口
export interface Streamer {
  id: string;
  platform: PlatformType;
  name: string;
  avatar: string;
  isLive: boolean;
  roomId: string;
  roomUrl: string;
  title?: string;
  category?: string;
  viewerCount?: number;
  startTime?: string;
  description?: string;
}

// 平台设置接口
export interface PlatformSettings {
  platform: PlatformType;
  enabled: boolean;
  cookie: string;
  username?: string;
}

// 全局设置
export interface AppSettings {
  platforms: Record<PlatformType, PlatformSettings>;
  refreshInterval: number; // 刷新间隔，单位分钟
  notifications: boolean; // 是否开启通知
  autoLaunch: boolean; // 是否开机自启动
  startMinimized: boolean; // 是否最小化启动
}

// API 接口返回结果
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 