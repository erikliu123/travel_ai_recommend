import { seasonInfo, type SeasonKey } from '@/data/cities';

interface SeasonNavProps {
  activeSeason: SeasonKey;
  onSeasonChange: (season: SeasonKey) => void;
}

const seasons: SeasonKey[] = ['spring', 'summer', 'autumn', 'winter', 'mayday', 'national', 'springfestival', 'zhejiang'];

const seasonColors: Record<SeasonKey, { bg: string; text: string; lightBg: string }> = {
  spring: { bg: 'bg-emerald-500', text: 'text-emerald-600', lightBg: 'bg-emerald-50' },
  summer: { bg: 'bg-cyan-500', text: 'text-cyan-600', lightBg: 'bg-cyan-50' },
  autumn: { bg: 'bg-amber-500', text: 'text-amber-600', lightBg: 'bg-amber-50' },
  winter: { bg: 'bg-blue-400', text: 'text-blue-500', lightBg: 'bg-blue-50' },
  mayday: { bg: 'bg-rose-500', text: 'text-rose-600', lightBg: 'bg-rose-50' },
  national: { bg: 'bg-red-600', text: 'text-red-600', lightBg: 'bg-red-50' },
  springfestival: { bg: 'bg-orange-500', text: 'text-orange-600', lightBg: 'bg-orange-50' },
  zhejiang: { bg: 'bg-teal-600', text: 'text-teal-700', lightBg: 'bg-teal-50' },
};

export default function SeasonNav({ activeSeason, onSeasonChange }: SeasonNavProps) {
  return (
    <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border py-3">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto scroll-hide pb-1">
          {seasons.map((season) => {
            const info = seasonInfo[season];
            const isActive = season === activeSeason;
            const colors = seasonColors[season];

            return (
              <button
                key={season}
                onClick={() => onSeasonChange(season)}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                  whitespace-nowrap smooth-transition
                  ${isActive
                    ? `${colors.bg} text-white shadow-md`
                    : `text-muted-foreground hover:${colors.lightBg} hover:${colors.text}`
                  }
                `}
              >
                <span>{info.icon}</span>
                <span>{info.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
