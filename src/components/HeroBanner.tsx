import { useState, useEffect, useCallback } from 'react';
import { seasonInfo, type SeasonKey } from '@/data/cities';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroBannerProps {
  season: SeasonKey;
}

export default function HeroBanner({ season }: HeroBannerProps) {
  const info = seasonInfo[season];
  const banners = info.banners || [info.banner];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const goNext = useCallback(() => {
    goTo((currentIndex + 1) % banners.length);
  }, [currentIndex, banners.length, goTo]);

  const goPrev = useCallback(() => {
    goTo((currentIndex - 1 + banners.length) % banners.length);
  }, [currentIndex, banners.length, goTo]);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [goNext]);

  // Reset when season changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsTransitioning(false);
  }, [season]);

  return (
    <section className="relative overflow-hidden rounded-xl sm:rounded-2xl mx-2 sm:mx-4 mt-2 sm:mt-4 mb-6 sm:mb-8 group" style={{ height: 'clamp(200px, 35vh, 480px)' }}>
      {/* Slides */}
      {banners.map((src, index) => (
        <div
          key={src}
          className="absolute inset-0 smooth-transition duration-600"
          style={{
            opacity: index === currentIndex ? 1 : 0,
            zIndex: index === currentIndex ? 1 : 0,
            pointerEvents: index === currentIndex ? 'auto' : 'none',
          }}
        >
          <img
            src={src}
            alt={`${info.label}风光`}
            className="absolute inset-0 w-full h-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center px-4 sm:px-8 md:px-16 max-w-2xl">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <span className="text-2xl sm:text-3xl">{info.icon}</span>
          <span className="text-white/80 text-xs sm:text-sm font-medium tracking-wider uppercase">
            {info.months}
          </span>
          {banners.length > 1 && (
            <span className="text-white/60 text-xs ml-2">
              {currentIndex + 1} / {banners.length}
            </span>
          )}
        </div>
        <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-white mb-2 sm:mb-3 font-serif">
          {info.label}旅行推荐
        </h1>
        <p className="text-white/80 text-sm sm:text-lg md:text-xl leading-relaxed">
          {info.description}
        </p>
        <div className="mt-3 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs sm:text-sm text-white">
            精选 10 个国内 + 5个国外目的地
          </span>
          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs sm:text-sm text-white">
            含交通攻略
          </span>
        </div>
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 hover:bg-black/50 smooth-transition"
            aria-label="上一张"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 hover:bg-black/50 smooth-transition"
            aria-label="下一张"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`rounded-full smooth-transition ${
                index === currentIndex
                  ? 'w-6 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`第${index + 1}张`}
            />
          ))}
        </div>
      )}

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-20 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
