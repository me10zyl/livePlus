import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import StreamerList from '../components/StreamerList';
import { Streamer, PlatformType } from '../../common/types';

const PlatformPage: React.FC = () => {
  const { platform } = useParams<{ platform: string }>();
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCookie, setHasCookie] = useState(false);
  const fetchData = async (force:boolean =false) => {
    if (!platform) return;

    
    try {
      setLoading(true);
      setError(null);
      
      const cookie = await window.electron.getCookie(platform as PlatformType);
      setHasCookie(!!cookie);
      
      if (!cookie) {
        const errorMsg = '未设置Cookie，请先在设置页面配置平台Cookie';
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      
      const response = await window.electron.getFollowingList(platform as PlatformType, force);
      
      if (response.success && response.data) {
        setStreamers(response.data);
        if (force) {
          toast.success('刷新成功');
        }
      } else {
        const errorMsg = response.error || '获取数据失败，请检查Cookie是否有效';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = `获取数据失败: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`获取${platform}关注列表失败`, error);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
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
          onClick={() => {
              fetchData(true);
          }}
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