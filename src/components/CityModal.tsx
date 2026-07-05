import { useState, useEffect } from 'react';
import { Plane, Train, Star, ThumbsUp, ThumbsDown, X, MapPin, Clock, ExternalLink, CheckCircle2, Edit2, Trash2, Users, BookOpen } from 'lucide-react';
import type { CityInfo } from '@/data/cities';
import type { User as UserType, Trip, TripPhoto } from '@/types';
import TripCheckIn from './TripCheckIn';
import TripFeedback from './TripFeedback';
import { api } from '@/lib/api';

interface CityModalProps {
  city: CityInfo | null;
  onClose: () => void;
  user: UserType | null;
  trip: Trip | null;
  onTripSuccess: (trip: Trip) => void;
  onTripDelete: (cityId: string) => void;
  onLoginClick: () => void;
}

interface PublicTrip extends Trip {
  username: string;
  avatar: string | null;
  photos: TripPhoto[];
}

const budgetLabels = ['', '经济型', '中等消费', '高消费'];

export default function CityModal({ city, onClose, user, trip, onTripSuccess, onTripDelete, onLoginClick }: CityModalProps) {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [publicTrips, setPublicTrips] = useState<PublicTrip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // Load public trip records when modal opens
  useEffect(() => {
    if (city) {
      setLoadingTrips(true);
      api.getCityTrips(city.id)
        .then(({ trips }) => setPublicTrips(trips))
        .catch(() => setPublicTrips([]))
        .finally(() => setLoadingTrips(false));
    }
  }, [city]);

  if (!city) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  const handleDeleteTrip = async () => {
    if (!confirm('确定要删除这条旅游记录吗？')) return;
    try {
      const { api: apiClient } = await import('@/lib/api');
      await apiClient.deleteTrip(city.id);
      onTripDelete(city.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="relative bg-background w-full sm:max-w-3xl sm:rounded-2xl rounded-t-2xl overflow-hidden max-h-[90vh] overflow-y-auto modal-shadow">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 smooth-transition">
          <X className="w-5 h-5" />
        </button>

        {/* Hero image */}
        <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
          {city.image ? (
            <img src={city.image} alt={`${city.name}风光`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-7xl mb-2 opacity-80">{city.name[0]}</div>
                <div className="text-xl font-medium opacity-90">{city.name}</div>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-sm">{city.province}</span>
            </div>
            <h2 className="text-3xl font-bold text-white font-serif">{city.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* Quick info */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              建议游玩 {city.suggestedDays} 天
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm">
              <Clock className="w-4 h-4" />
              最佳 {city.bestMonths}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm">
              {budgetLabels[city.budgetLevel]}
            </span>
          </div>

          {/* AI Guide Card */}
          {city.guideUrl && (
            <a
              href={city.guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-6 block rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 hover:shadow-md smooth-transition group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                    AI 详细攻略
                    <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 smooth-transition" />
                  </h3>
                  <p className="text-sm text-blue-700">
                    由 AI 生成的详细行程规划，包含每日时间线、景点推荐、住宿美食指南
                  </p>
                </div>
              </div>
            </a>
          )}

          {/* Trip status - User's own trip */}
          {trip ? (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">已打卡</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowFeedback(true)} className="p-1.5 rounded-full hover:bg-green-100 smooth-transition" title="编辑反馈">
                    <Edit2 className="w-4 h-4 text-green-600" />
                  </button>
                  <button onClick={handleDeleteTrip} className="p-1.5 rounded-full hover:bg-red-100 smooth-transition" title="删除记录">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-green-700">旅游日期：{trip.trip_date}</div>
              {trip.ai_guide_url && (
                <a href={trip.ai_guide_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-sm text-green-700 hover:text-green-900">
                  <ExternalLink className="w-3.5 h-3.5" />
                  查看 AI 攻略
                </a>
              )}
              {trip.top_recommendation && (
                <div className="mt-2 text-sm text-green-700">
                  最推荐：<span className="font-medium">{trip.top_recommendation}</span>
                </div>
              )}
              {trip.feedback && (
                <div className="mt-2 text-sm text-green-700 line-clamp-2">{trip.feedback}</div>
              )}
            </div>
          ) : (
            <div className="mb-6">
              {user ? (
                <button
                  onClick={() => setShowCheckIn(true)}
                  className="w-full py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 smooth-transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  我去过这里，打卡记录
                </button>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="w-full py-3 rounded-xl bg-secondary text-foreground font-medium hover:bg-muted smooth-transition text-sm"
                >
                  登录后可以打卡并记录旅行
                </button>
              )}
            </div>
          )}

          {/* Other users' trip records */}
          {publicTrips.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold font-serif">其他用户的打卡记录 ({publicTrips.length})</h3>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {publicTrips.map((publicTrip) => (
                  <div key={publicTrip.id} className="p-3 rounded-lg border border-border bg-secondary">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                          {publicTrip.username[0]}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{publicTrip.username}</div>
                          <div className="text-xs text-muted-foreground">{publicTrip.trip_date}</div>
                        </div>
                      </div>
                      {publicTrip.ai_guide_url && (
                        <a href={publicTrip.ai_guide_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          AI攻略
                        </a>
                      )}
                    </div>
                    {publicTrip.top_recommendation && (
                      <div className="text-sm mb-1">
                        <span className="text-muted-foreground">最推荐：</span>
                        <span className="font-medium">{publicTrip.top_recommendation}</span>
                      </div>
                    )}
                    {publicTrip.feedback && (
                      <div className="text-sm text-muted-foreground line-clamp-2 mb-2">{publicTrip.feedback}</div>
                    )}
                    {/* Show only scenery photos for other users */}
                    {publicTrip.photos.filter(p => p.photo_type === 'scenery').length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {publicTrip.photos.filter(p => p.photo_type === 'scenery').map((photo) => (
                          <img
                            key={photo.id}
                            src={photo.photo_url}
                            alt={photo.caption || '风景照'}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {loadingTrips && (
            <div className="mb-6 text-center text-sm text-muted-foreground">
              加载打卡记录中...
            </div>
          )}

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed mb-6">{city.description}</p>

          {/* Transport */}
          <div className="mb-6 p-4 rounded-lg bg-secondary">
            <h3 className="text-lg font-semibold mb-3 font-serif">🚄 从杭州出发</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600 shrink-0">
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-sm">飞机</div>
                  <div className="text-muted-foreground text-sm">{city.transport.flight}</div>
                  {city.transport.flightNote && (
                    <div className="text-xs text-muted-foreground mt-0.5">{city.transport.flightNote}</div>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
                <div className="p-2 rounded-full bg-green-100 text-green-600 shrink-0">
                  <Train className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-sm">高铁</div>
                  <div className="text-muted-foreground text-sm">{city.transport.train}</div>
                  {city.transport.trainNote && (
                    <div className="text-xs text-muted-foreground mt-0.5">{city.transport.trainNote}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Attractions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 font-serif">📍 推荐景点</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {city.attractions.map((attr) => (
                <div key={attr.name} className="p-3 rounded-lg border border-border">
                  <div className="font-medium text-sm mb-1">{attr.name}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{attr.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-3 font-serif flex items-center gap-2">
                <span className="text-green-500"><ThumbsUp className="w-5 h-5" /></span>
                优点
              </h3>
              <ul className="space-y-2">
                {city.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <span className="text-muted-foreground">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 font-serif flex items-center gap-2">
                <span className="text-red-500"><ThumbsDown className="w-5 h-5" /></span>
                缺点
              </h3>
              <ul className="space-y-2">
                {city.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <span className="text-muted-foreground">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCheckIn && user && (
        <TripCheckIn
          cityId={city.id}
          cityName={city.name}
          existingTrip={trip}
          onSuccess={(newTrip) => {
            onTripSuccess(newTrip);
            setShowCheckIn(false);
          }}
          onClose={() => setShowCheckIn(false)}
        />
      )}

      {showFeedback && user && trip && (
        <TripFeedback
          trip={trip}
          cityName={city.name}
          onUpdate={(updatedTrip) => {
            onTripSuccess(updatedTrip);
          }}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
}
