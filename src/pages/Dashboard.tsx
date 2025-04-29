import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Streamer, PlatformType } from '../../common/types';
import StreamerList from '../components/StreamerList';

interface DashboardProps {
  streamers: {[key in PlatformType]?: Streamer[]};
}

// 在 Dashboard 组件中添加平台统计信息
const Dashboard: React.FC<DashboardProps> = () => {
  const [liveStreamers, setLiveStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState(false);
  const [allLoading, setAllLoading] = useState(false);
  const [streamers, setStreamers] = useState<{[key in PlatformType]?: Streamer[]}>({});
  
  // 从所有平台提取正在直播的主播
  useEffect(() => {
    console.log('开始提取正在直播的主播');
    const allLiveStreamers: Streamer[] = [];
    
    Object.values(streamers).forEach(platformStreamers => {
      if (platformStreamers) {
        const liveOnes = platformStreamers.filter(streamer => streamer.isLive);
        allLiveStreamers.push(...liveOnes);
      }
    });
    
    // 按观看人数排序
    allLiveStreamers.sort((a, b) => {
      const countA = a.viewerCount || 0;
      const countB = b.viewerCount || 0;
      return countB - countA;
    });
    
    setLiveStreamers(allLiveStreamers);
  }, [streamers]);

  useEffect(()=>{
    console.log('Dashboard进入');
    refreshAllPlatforms(false)
  }, []);

  const refreshAllPlatforms = async (force:boolean = true) => {
    console.log('开始刷新所有平台');
    setLoading(true);
    setAllLoading(true);
    const platforms: PlatformType[] = ['douyu', 'bilibili', 'huya', 'douyin'];
    
    let hasError = false;
    try {
      await Promise.all(platforms.map(async platform => {
        try {
          const response = await window.electron.getFollowingList(platform, force);
          console.log(`刷新${platform}完成`, response);
          if (!response.success) {
            hasError = true;
            toast.error(`刷新${platform}失败: ${response.error || '未知错误'}`);
          }else{
            setStreamers(prev => ({ ...prev, [platform]: response.data }));
          }
        } catch (error) {
          hasError = true;
          console.error(`刷新${platform}失败`, error);
          toast.error(`刷新${platform}失败: ${error}`);
        }
        setAllLoading(false)
      }));
      
      if (!hasError) {
        if(force){
          toast.success('所有平台刷新成功');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // 添加平台统计信息
  const platformStats = Object.entries(streamers).map(([platform, list]) => ({
    platform: platform as PlatformType,
    total: list?.length || 0,
    live: list?.filter(s => s.isLive).length || 0
  }));
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>直播状态监控</h1>
        <button 
          className="refresh-button"
          onClick={refreshAllPlatforms}
          disabled={loading}
        >
          {loading ? '刷新中...' : '刷新所有平台'}
        </button>
      </div>
      
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>正在直播</h3>
          <div className="summary-count">{liveStreamers.length}</div>
        </div>
        
        <div className="summary-card">
          <h3>关注总数</h3>
          <div className="summary-count">
            {Object.values(streamers).reduce((total, list) => total + (list?.length || 0), 0)}
          </div>
        </div>
        
        <div className="platform-links">
          {['douyu', 'bilibili', 'huya', 'douyin'].map(platform => (
            <Link 
              key={platform} 
              to={`/platform/${platform}`}
              className="platform-link"
            >
              {platform === 'douyu' ? '斗鱼' : 
               platform === 'bilibili' ? 'B站' : 
               platform === 'huya' ? '虎牙' : '抖音'}
              <span className="count">
                {streamers[platform as PlatformType]?.filter(s => s.isLive).length || 0}
              </span>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="live-streamers-section">
        <h2>正在直播 ({liveStreamers.length})</h2>
        <StreamerList streamers={liveStreamers} loading={allLoading} />
      </div>
      
      <div className="platform-stats">
        {platformStats.map(stat => (
          <Link 
            key={stat.platform} 
            to={`/platform/${stat.platform}`}
            className="platform-stat-card"
            style={{ 
              borderColor: stat.platform === 'douyu' ? '#ff5d23' : 
                          stat.platform === 'bilibili' ? '#00a1d6' : 
                          stat.platform === 'huya' ? '#ffb700' : 
                          '#fe2c55' 
            }}
          >
            <div className="platform-stat-icon">
              {stat.platform === 'douyu' ? '🐟' : 
               stat.platform === 'bilibili' ? '📺' : 
               stat.platform === 'huya' ? '🐯' : '🎵'}
            </div>
            <div className="platform-stat-name">
              {stat.platform === 'douyu' ? '斗鱼' : 
               stat.platform === 'bilibili' ? 'B站' : 
               stat.platform === 'huya' ? '虎牙' : '抖音'}
            </div>
            <div className="platform-stat-counts">
              <span className="live-count">{stat.live} 直播中</span>
              <span className="total-count">共 {stat.total} 关注</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;