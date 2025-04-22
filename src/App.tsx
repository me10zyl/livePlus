import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { default as Sidebar } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import PlatformPage from './pages/PlatformPage';
import { Streamer, PlatformType } from '../common/types';
import './styles/App.css';

// 定义声明electron全局对象
declare global {
  interface Window {
    electron: {
      getCookie: (platform: string) => Promise<string>;
      setCookie: (platform: string, cookie: string) => Promise<boolean>;
      getFollowingList: (platform: string) => Promise<Streamer[]>;
      setFollowingList: (platform: string, list: Streamer[]) => Promise<boolean>;
    };
  }
}

function App() {
  // 当前选中的平台
  const [activePlatform, setActivePlatform] = useState<PlatformType | null>(null);
  // 所有平台的直播状态数据
  const [streamers, setStreamers] = useState<{[key in PlatformType]?: Streamer[]}>({});
  // 加载状态
  const [loading, setLoading] = useState(false);

  // 从electron获取关注列表数据
  const fetchFollowingData = async (platform: PlatformType) => {
    try {
      setLoading(true);
      // 从缓存中获取之前保存的列表
      console.log('获取关注列表(' + platform + ")")
      const followingList = await window.electron.getFollowingList(platform);
      console.log('关注列表结果(' + platform + ")", followingList)
      if (followingList && followingList.length > 0) {
        console.log('添加关注列表(' + platform + ")到streamers")
        setStreamers(prev => ({ ...prev, [platform]: followingList }));
      }
      setLoading(false);
    } catch (error) {
      console.error(`获取${platform}关注列表失败`, error);
      setLoading(false);
    }
  };

  // 首次加载默认获取所有平台数据
  useEffect(() => {
    console.log('首次加载默认获取所有平台数据')
    const platforms: PlatformType[] = ['douyu', 'bilibili', 'huya', 'douyin'];
    platforms.forEach(platform => {
      fetchFollowingData(platform);
    });
    // 默认选中斗鱼平台

    //setActivePlatform('douyu');
  }, []);

  return (
    <div className="app-container">
      <Sidebar 
        activePlatform={activePlatform} 
        setActivePlatform={setActivePlatform} 
      />
    
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard streamers={streamers} />} />
          <Route path="/platform/:platform" element={<PlatformPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 