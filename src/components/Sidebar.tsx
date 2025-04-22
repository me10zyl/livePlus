import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlatformType } from '../../common/types';

interface SidebarProps {
  activePlatform: PlatformType | null;
  setActivePlatform: (platform: PlatformType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePlatform, setActivePlatform }) => {
  const location = useLocation();
  
  const platforms = [
    { id: 'douyu' as PlatformType, name: '斗鱼', icon: '🐟' },
    { id: 'bilibili' as PlatformType, name: 'B站', icon: '📺' },
    { id: 'huya' as PlatformType, name: '虎牙', icon: '🐯' },
    { id: 'douyin' as PlatformType, name: '抖音', icon: '🎵' }
  ];

  const isActive = (platform: PlatformType) => {
    return activePlatform === platform || location.pathname === `/platform/${platform}`;
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <h2>直播状态监控器</h2>
      </div>
      
      <nav className="nav-menu">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          <span className="icon">🏠</span>
          <span className="text">首页</span>
        </Link>
        
        <div className="platform-section">
          <h3>平台</h3>
          {platforms.map(platform => (
            <Link
              key={platform.id}
              to={`/platform/${platform.id}`}
              className={isActive(platform.id) ? 'active' : ''}
              onClick={() => setActivePlatform(platform.id)}
            >
              <span className="icon">{platform.icon}</span>
              <span className="text">{platform.name}</span>
            </Link>
          ))}
        </div>
        
        <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>
          <span className="icon">⚙️</span>
          <span className="text">设置</span>
        </Link>
      </nav>
      
      <div className="sidebar-footer">
        <p>版本: 1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar;