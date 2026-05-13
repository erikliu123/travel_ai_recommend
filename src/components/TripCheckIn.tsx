import { useState } from 'react';
import { Calendar, Link, X, Check } from 'lucide-react';
import { api } from '@/lib/api';
import type { Trip } from '@/types';

interface TripCheckInProps {
  cityId: string;
  cityName: string;
  existingTrip: Trip | null;
  onSuccess: (trip: Trip) => void;
  onClose: () => void;
}

export default function TripCheckIn({ cityId, cityName, existingTrip, onSuccess, onClose }: TripCheckInProps) {
  const [tripDate, setTripDate] = useState(existingTrip?.trip_date || new Date().toISOString().split('T')[0]);
  const [aiGuideUrl, setAiGuideUrl] = useState(existingTrip?.ai_guide_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { trip } = await api.checkIn(cityId, tripDate, aiGuideUrl || undefined);
      onSuccess(trip);
    } catch (err) {
      setError(err instanceof Error ? err.message : '打卡失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="relative bg-background w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl overflow-hidden max-h-[80vh] overflow-y-auto modal-shadow" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted smooth-transition">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-full bg-green-100">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold font-serif">{existingTrip ? '更新打卡记录' : '打卡'}</h2>
          </div>
          <p className="text-sm text-muted-foreground">记录你在 {cityName} 的旅行</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">旅游日期</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring smooth-transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">AI 攻略链接（可选）</label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="url"
                value={aiGuideUrl}
                onChange={(e) => setAiGuideUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring smooth-transition"
                placeholder="https://..."
              />
            </div>
            {aiGuideUrl && (
              <a href={aiGuideUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground mt-1 inline-block truncate max-w-full">
                预览链接
              </a>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted smooth-transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !tripDate}
              className="flex-1 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 smooth-transition disabled:opacity-50"
            >
              {loading ? '处理中...' : existingTrip ? '更新' : '确认打卡'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
