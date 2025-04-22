import React, { useState, useEffect } from 'react';
import { PlatformType } from '../../common/types';

interface CookieSettingsProps {
  platform: PlatformType;
  onSave: (cookie: string) => void;
}

const CookieSettings: React.FC<CookieSettingsProps> = ({ platform, onSave }) => {
  const [cookie, setCookie] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 加载已保存的Cookie
  useEffect(() => {
    const loadCookie = async () => {
      try {
        const savedCookie = await window.electron.getCookie(platform);
        setCookie(savedCookie || '');
      } catch (error) {
        console.error('加载Cookie失败', error);
      }
    };
    
    loadCookie();
  }, [platform]);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const success = await window.electron.setCookie(platform, cookie);
      if (success) {
        setMessage('Cookie保存成功！');
        onSave(cookie);
      } else {
        setMessage('Cookie保存失败，请重试');
      }
    } catch (error) {
      console.error('保存Cookie失败', error);
      setMessage('保存失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

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
    <div className="cookie-settings">
      <h3>{getPlatformName()}平台Cookie设置</h3>
      <div className="form-group">
        <label htmlFor={`${platform}-cookie`}>Cookie:</label>
        <textarea
          id={`${platform}-cookie`}
          value={cookie}
          onChange={(e) => setCookie(e.target.value)}
          rows={5}
          placeholder={`请输入${getPlatformName()}平台的Cookie...`}
        />
      </div>
      
      {message && <div className={message.includes('成功') ? 'success-message' : 'error-message'}>{message}</div>}
      
      <button 
        onClick={handleSave} 
        disabled={loading}
        className="save-button"
      >
        {loading ? '保存中...' : '保存Cookie'}
      </button>
      
      <div className="help-text">
        <p>如何获取Cookie: </p>
        <ol>
          <li>登录{getPlatformName()}网站</li>
          <li>按F12打开开发者工具</li>
          <li>切换到Network(网络)选项卡</li>
          <li>刷新页面</li>
          <li>点击任意请求，在Headers中找到Cookie</li>
          <li>复制完整Cookie值粘贴到上方输入框</li>
        </ol>
      </div>
    </div>
  );
};

export default CookieSettings;