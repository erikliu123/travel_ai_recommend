import { seasonInfo, type SeasonKey } from '@/data/cities';

interface HeroBannerProps {
  season: SeasonKey;
}

export default function HeroBanner({ season }: HeroBannerProps) {
  const info = seasonInfo[season];

  return (
    <section className="relative overflow-hidden rounded-2xl mx-4 mt-4 mb-8" style={{ height: 'clamp(280px, 40vh, 480px)' }}>
      <img
        src={info.banner}
        alt={info.description}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">{info.icon}</span>
          <span className="text-white/80 text-sm font-medium tracking-wider uppercase">
            {info.months}
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 font-serif">
          {info.label}旅行推荐
        </h1>
        <p className="text-white/80 text-lg md:text-xl leading-relaxed">
          {info.description}
        </p>
        <div className="mt-6 flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm">
            精选 10 个目的地
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm">
            含交通攻略
          </span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
