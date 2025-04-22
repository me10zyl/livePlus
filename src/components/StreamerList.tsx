import React from 'react';
import { Streamer } from '../../common/types';

interface StreamerListProps {
  streamers: Streamer[];
  loading: boolean;
}

const StreamerList: React.FC<StreamerListProps> = ({ streamers, loading }) => {
  // 按照直播状态排序：在线的排在前面
  const sortedStreamers = [...streamers].sort((a, b) => {
    if (a.isLive && !b.isLive) return -1;
    if (!a.isLive && b.isLive) return 1;
    return 0;
  });

  if (loading) {
    return <div className="loading-container">加载中...</div>;
  }

  if (streamers.length === 0) {
    return <div className="empty-list">暂无关注主播数据</div>;
  }

  const handleOpenStream = (url: string) => {
    window.open(url, '_blank');
  };

  // 获取平台名称和图标
  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case 'douyu':
        return { name: '斗鱼', icon: '🐟', color: '#ff5d23' };
      case 'bilibili':
        return { name: 'B站', icon: '📺', color: '#00a1d6' };
      case 'huya':
        return { name: '虎牙', icon: '🐯', color: '#ffb700' };
      case 'douyin':
        return { name: '抖音', icon: '🎵', color: '#fe2c55' };
      default:
        return { name: platform, icon: '🔴', color: '#666666' };
    }
  };

  return (
    <div className="streamer-list">
      {sortedStreamers.map(streamer => (
        <div 
          key={`${streamer.platform}-${streamer.id}`} 
          className={`streamer-card ${streamer.isLive ? 'live' : 'offline'}`}
          onClick={() => streamer.isLive && handleOpenStream(streamer.roomUrl)}
        >
          <div className="streamer-avatar">
            <img src={streamer.avatar} alt={streamer.name} referrerPolicy="no-referrer" />
            {streamer.isLive && <span className="live-badge">LIVE</span>}
          </div>
          
          <div className="streamer-info">
            <div className="streamer-header">
              <h3 className="streamer-name">{streamer.name}</h3>
              <div 
                className="platform-badge"
                style={{ backgroundColor: getPlatformInfo(streamer.platform).color }}
              >
                <span className="platform-icon">{getPlatformInfo(streamer.platform).icon}</span>
                <span className="platform-name">{getPlatformInfo(streamer.platform).name}</span>
              </div>
            </div>
            
            {streamer.isLive ? (
              <>
                <div className="stream-title">{streamer.title || '无标题'}</div>
                <div className="stream-meta">
                  <span className="category">{streamer.category || '未知分类'}</span>
                  <span className="viewer-count">
                    {streamer.viewerCount ? `${streamer.viewerCount.toLocaleString()} 观众` : ''}
                  </span>
                </div>
              </>
            ) : (
              <div className="offline-message">未开播</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StreamerList;