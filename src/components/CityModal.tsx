import { Plane, Train, Star, ThumbsUp, ThumbsDown, X, MapPin, Clock } from 'lucide-react';
import type { CityInfo } from '@/data/cities';

interface CityModalProps {
  city: CityInfo | null;
  onClose: () => void;
}

const budgetLabels = ['', '经济型', '中等消费', '高消费'];
const budgetIcons = ['', '', '💰', '💰💰', '💰💰💰'];

export default function CityModal({ city, onClose }: CityModalProps) {
  if (!city) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className="relative bg-background w-full sm:max-w-3xl sm:rounded-2xl rounded-t-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-scale-in modal-shadow"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 smooth-transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero image */}
        <div className="relative h-64 sm:h-80 overflow-hidden">
          {city.image ? (
            <img
              src={city.image}
              alt={`${city.name}风光`}
              className="w-full h-full object-cover"
            />
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
        <div className="p-6 sm:p-8">
          {/* Quick info */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              建议游玩 {city.suggestedDays} 天
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm">
              <Clock className="w-4 h-4" />
              最佳 {city.bestMonths}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm">
              {budgetIcons[city.budgetLevel]} {budgetLabels[city.budgetLevel]}
            </span>
          </div>

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
    </div>
  );
}
