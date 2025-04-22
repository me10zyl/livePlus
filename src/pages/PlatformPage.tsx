import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StreamerList from '../components/StreamerList';
import { Streamer, PlatformType } from '../../common/types';

const PlatformPage: React.FC = () => {
  const { platform } = useParams<{ platform: string }>();
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCookie, setHasCookie] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!platform) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // 检查是否有Cookie
        const cookie = await window.electron.getCookie(platform as PlatformType);
        setHasCookie(!!cookie);
        
        if (!cookie) {
          setError('未设置Cookie，请先在设置页面配置平台Cookie');
          setLoading(false);
          return;
        }
        
        // 获取关注列表
        const followingList = await window.electron.getFollowingList(platform as PlatformType);
        
        if (Array.isArray(followingList)) {
          setStreamers(followingList);
        } else {
          setError('获取数据失败，请检查Cookie是否有效');
        }
      } catch (error) {
        console.error(`获取${platform}关注列表失败`, error);
        setError(`获取数据失败: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [platform]);

  const getPlatformName = () => {
    switch (platform) {
      case 'douyu': return '斗鱼';
      case 'bilibili': return 'B站';
      case 'huya': return '虎牙';
      case 'douyin': return '抖音';
      default: return platform;
    }
  };

  return (
    <div className="platform-page">
      <div className="page-header">
        <h1>{getPlatformName()}关注列表</h1>
        <button 
          className="refresh-button"
          onClick={() => window.location.reload()}
          disabled={loading}
        >
          刷新
        </button>
      </div>
      
      {error ? (
        <div className="error-message">
          <p>{error}</p>
          {!hasCookie && (
            <button onClick={() => window.location.href = '/settings'}>
              前往设置
            </button>
          )}
        </div>
      ) : (
        <StreamerList streamers={streamers} loading={loading} />
      )}
    </div>
  );
};

export default PlatformPage;