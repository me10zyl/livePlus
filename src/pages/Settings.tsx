import React, { useState } from 'react';
import CookieSettings from '../components/CookieSettings';
import { PlatformType } from '../../common/types';

const Settings: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<PlatformType>('douyu');
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [notifications, setNotifications] = useState(true);
  
  const platforms: PlatformType[] = ['douyu', 'bilibili', 'huya', 'douyin'];
  
  const handleCookieSave = async (cookie: string) => {
    // 保存后刷新数据
    try {
      await window.electron.getFollowingList(activePlatform);
    } catch (error) {
      console.error('刷新关注列表失败', error);
    }
  };
  
  return (
    <div className="settings-page">
      <h1>应用设置</h1>
      
      <div className="settings-section">
        <h2>平台设置</h2>
        <div className="platform-tabs">
          {platforms.map(platform => (
            <button
              key={platform}
              className={activePlatform === platform ? 'active' : ''}
              onClick={() => setActivePlatform(platform)}
            >
              {platform === 'douyu' ? '斗鱼' : 
               platform === 'bilibili' ? 'B站' : 
               platform === 'huya' ? '虎牙' : '抖音'}
            </button>
          ))}
        </div>
        
        <div className="platform-settings">
          <CookieSettings 
            platform={activePlatform} 
            onSave={handleCookieSave} 
          />
        </div>
      </div>
      
      <div className="settings-section">
        <h2>通用设置</h2>
        
        <div className="form-group">
          <label htmlFor="refresh-interval">刷新间隔 (分钟):</label>
          <input
            id="refresh-interval"
            type="number"
            min="1"
            max="60"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 5)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="notifications">
            <input
              id="notifications"
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            开播通知
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;