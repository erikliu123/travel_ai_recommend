import { useState } from 'react';
import { X, User, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import type { User as UserType } from '@/types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: UserType) => void;
}

export default function AuthModal({ onClose, onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [qqLoading, setQqLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user } = isLogin
        ? await api.login(username, password)
        : await api.register(username, password);
      onLogin(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleQQLogin = async () => {
    try {
      setQqLoading(true);
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const url = API_BASE.startsWith('http')
        ? `${API_BASE}/auth/qq`
        : `${window.location.origin}${API_BASE}/auth/qq`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setError(data.error || 'QQ 登录失败');
      }
    } catch (err) {
      setError('QQ 登录失败，请稍后重试');
    } finally {
      setQqLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="relative bg-background w-full max-w-md mx-4 rounded-2xl overflow-hidden modal-shadow" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted smooth-transition">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <h2 className="text-2xl font-bold font-serif">{isLogin ? '登录' : '注册'}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin ? '登录后可以记录旅游打卡和上传照片' : '创建账号开始你的旅游记录'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">用户名</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring smooth-transition"
                placeholder="请输入用户名"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring smooth-transition"
                placeholder={isLogin ? '请输入密码' : '至少6个字符'}
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full py-2.5 rounded-lg bg-foreground text-background font-medium hover:opacity-90 smooth-transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">其他登录方式</span>
            </div>
          </div>

          {/* QQ Login Button */}
          <button
            type="button"
            onClick={handleQQLogin}
            disabled={qqLoading}
            className="w-full py-2.5 rounded-lg border border-blue-400 text-blue-600 font-medium hover:bg-blue-50 smooth-transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 14.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-7 0c-.83 0-1.5-.67-1.5-1.5S7.67 13.5 8.5 13.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7.5-5.5c-1.38 0-2.5-1.12-2.5-2.5S14.62 6 16 6s2.5 1.12 2.5 2.5S17.38 11 16 11zm-7 0C7.62 11 6.5 9.88 6.5 8.5S7.62 6 9 6s2.5 1.12 2.5 2.5S10.38 11 9 11z"/>
            </svg>
            {qqLoading ? '跳转中...' : 'QQ 登录'}
          </button>

          <div className="text-center text-sm text-muted-foreground">
            {isLogin ? '还没有账号？' : '已有账号？'}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-foreground hover:underline"
            >
              {isLogin ? '立即注册' : '去登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
