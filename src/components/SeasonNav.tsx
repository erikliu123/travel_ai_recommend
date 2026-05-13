import { seasonInfo, type SeasonKey } from '@/data/cities';
import { User, LogOut } from 'lucide-react';
import type { User as UserType } from '@/types';

interface SeasonNavProps {
  activeSeason: SeasonKey;
  onSeasonChange: (season: SeasonKey) => void;
  user: UserType | null;
  onLogout: () => void;
  onLoginClick: () => void;
  activeView: 'seasons' | 'guides';
  onViewChange: (view: 'seasons' | 'guides') => void;
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

export default function SeasonNav({ activeSeason, onSeasonChange, user, onLogout, onLoginClick, activeView, onViewChange }: SeasonNavProps) {
  return (
    <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border py-2 sm:py-3">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex-1 overflow-x-auto scroll-hide">
            <div className="flex items-center gap-0.5 sm:gap-1 pb-1">
              {/* AI Guides Tab */}
              <button
                onClick={() => onViewChange('guides')}
                className={`
                  flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium
                  whitespace-nowrap smooth-transition shrink-0
                  ${activeView === 'guides'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-muted-foreground hover:bg-purple-50 hover:text-purple-600'
                  }
                `}
              >
                <span className="text-sm sm:text-base">📖</span>
                <span>AI攻略</span>
              </button>

              {/* Divider */}
              <div className="w-px h-5 bg-border mx-1 shrink-0" />

              {seasons.map((season) => {
                const info = seasonInfo[season];
                const isActive = season === activeSeason && activeView === 'seasons';
                const colors = seasonColors[season];

                return (
                  <button
                    key={season}
                    onClick={() => {
                      onViewChange('seasons');
                      onSeasonChange(season);
                    }}
                    className={`
                      flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium
                      whitespace-nowrap smooth-transition shrink-0
                      ${isActive
                        ? `${colors.bg} text-white shadow-md`
                        : `text-muted-foreground hover:${colors.lightBg} hover:${colors.text}`
                      }
                    `}
                  >
                    <span className="text-sm sm:text-base">{info.icon}</span>
                    <span>{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ml-2 sm:ml-4 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">Hi, {user.username}</span>
                <div className="p-2 rounded-full bg-secondary">
                  <User className="w-4 h-4 text-foreground" />
                </div>
                <button onClick={onLogout} className="p-2 rounded-full hover:bg-muted smooth-transition" title="退出登录">
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs sm:text-sm font-medium text-foreground hover:bg-muted smooth-transition"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">登录</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
