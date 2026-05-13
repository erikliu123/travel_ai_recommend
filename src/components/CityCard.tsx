import type { CityInfo } from '@/data/cities';
import { Plane, Train, Star, Tag, CheckCircle2 } from 'lucide-react';

interface CityCardProps {
  city: CityInfo;
  onClick: (city: CityInfo) => void;
  index: number;
  isVisited?: boolean;
}

const budgetLabels = ['', '经济型', '中等消费', '高消费'];

export default function CityCard({ city, onClick, index, isVisited }: CityCardProps) {
  const gradientMap: Record<string, string> = {
    kunming: 'from-emerald-400 to-teal-500',
    wuyuan: 'from-yellow-400 to-green-500',
    linzhi: 'from-pink-400 to-rose-500',
    wuhan: 'from-pink-300 to-rose-400',
    luoyang: 'from-pink-400 to-fuchsia-500',
    yangzhou: 'from-green-400 to-emerald-500',
    guilin: 'from-emerald-500 to-cyan-500',
    dali: 'from-blue-400 to-indigo-500',
    dali_spring: 'from-sky-400 to-blue-500',
    suzhou: 'from-teal-400 to-cyan-500',
    nanjing: 'from-purple-400 to-pink-500',
    qingdao: 'from-cyan-400 to-blue-500',
    dalian: 'from-sky-400 to-blue-500',
    hulunbeier: 'from-green-500 to-emerald-600',
    jiuzhaigou: 'from-teal-500 to-cyan-600',
    lijiang: 'from-indigo-400 to-purple-500',
    chengde: 'from-amber-400 to-orange-500',
    guiyang: 'from-emerald-400 to-green-500',
    xining: 'from-blue-400 to-sky-500',
    yili: 'from-violet-400 to-purple-500',
    zhangjiajie: 'from-green-600 to-teal-500',
    beijing: 'from-red-500 to-amber-500',
    ejina: 'from-amber-400 to-yellow-600',
    kanas: 'from-orange-400 to-amber-500',
    tengchong: 'from-amber-500 to-yellow-400',
    huangshan: 'from-stone-500 to-green-600',
    changbaishan: 'from-blue-500 to-sky-400',
    harbin: 'from-sky-400 to-indigo-400',
    sanya: 'from-cyan-400 to-blue-500',
    xishuangbanna: 'from-green-500 to-teal-500',
    wusongdao: 'from-slate-300 to-blue-300',
    mohe: 'from-slate-400 to-blue-600',
    chengdu: 'from-red-400 to-orange-500',
    xian: 'from-amber-600 to-red-600',
    chongqing: 'from-orange-500 to-red-500',
    xiamen: 'from-teal-400 to-cyan-400',
    fenghuang: 'from-stone-500 to-emerald-500',
    dunhuang: 'from-amber-500 to-orange-500',
    xianggelila: 'from-purple-500 to-indigo-600',
    lasa: 'from-amber-500 to-red-600',
    daocheng: 'from-emerald-500 to-blue-600',
    beihai: 'from-cyan-400 to-teal-500',
    kyoto: 'from-pink-400 to-rose-500',
    hokkaido: 'from-blue-300 to-indigo-400',
    santorini: 'from-cyan-400 to-blue-500',
    bangkok: 'from-amber-400 to-orange-500',
    maldives: 'from-teal-400 to-emerald-500',
    queenstown: 'from-green-500 to-sky-500',
    paris: 'from-violet-400 to-purple-500',
    amsterdam: 'from-orange-400 to-pink-500',
    rome: 'from-amber-500 to-red-500',
    jeju: 'from-green-400 to-cyan-400',
    singapore: 'from-red-400 to-amber-400',
  };

  const gradient = gradientMap[city.id] || 'from-gray-400 to-gray-600';
  const displayTags = city.tags?.slice(0, 2) || [];

  return (
    <article
      className="city-card group animate-fade-in-up active:scale-95"
      style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
      onClick={() => onClick(city)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(city); }}
      aria-label={`查看${city.name}旅游攻略`}
    >
      {/* Image area */}
      <div className="relative h-40 sm:h-48 md:h-52 overflow-hidden">
        {city.image ? (
          <img
            src={city.image}
            alt={`${city.name}风光`}
            className="w-full h-full object-cover smooth-transition duration-500 group-hover:scale-110 group-hover:brightness-90"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center smooth-transition duration-500 group-hover:scale-105`}>
            <div className="text-center text-white">
              <div className="text-4xl sm:text-5xl mb-1 sm:mb-2 opacity-80">{city.name[0]}</div>
              <div className="text-xs sm:text-sm font-medium opacity-90">{city.name}</div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 gradient-overlay" />

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1.5 sm:gap-2">
          <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-foreground">
            {city.province}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-foreground flex items-center gap-0.5">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            {city.suggestedDays}天
          </span>
        </div>

        {/* Visited badge - prominent */}
        {isVisited && (
          <div className="absolute top-10 left-2 sm:top-12 sm:left-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500 text-white text-xs font-bold shadow-lg animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" />
              已打卡
            </span>
          </div>
        )}

        {/* Budget badge */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-xs text-white">
            {budgetLabels[city.budgetLevel]}
          </span>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3">
          <h3 className="text-lg sm:text-xl font-bold text-white font-serif drop-shadow-lg">{city.name}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3 leading-relaxed">
          {city.description}
        </p>

        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3">
            {displayTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Transport info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 sm:pt-3 border-t border-border">
          <span className="flex items-center gap-1 min-w-0">
            <Plane className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{city.transport.flight}</span>
          </span>
          <span className="flex items-center gap-1 min-w-0">
            <Train className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{city.transport.train}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
