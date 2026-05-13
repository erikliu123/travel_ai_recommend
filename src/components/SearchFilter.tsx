import { Search, X } from 'lucide-react';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
  availableTags: string[];
  totalResults: number;
  filteredCount: number;
}

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  activeTag,
  onTagChange,
  availableTags,
  totalResults,
  filteredCount,
}: SearchFilterProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-4">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索目的地、省份、景点..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-10 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring smooth-transition"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted smooth-transition"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Filter tags */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium mr-1">筛选：</span>
        <button
          onClick={() => onTagChange(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium smooth-transition ${
            !activeTag
              ? 'bg-foreground text-background'
              : 'bg-secondary text-muted-foreground hover:bg-muted'
          }`}
        >
          全部
        </button>
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagChange(activeTag === tag ? null : tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium smooth-transition ${
              activeTag === tag
                ? 'bg-foreground text-background'
                : 'bg-secondary text-muted-foreground hover:bg-muted'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results count */}
      {(searchQuery || activeTag) && (
        <div className="mt-3 text-xs text-muted-foreground">
          找到 <span className="font-medium text-foreground">{filteredCount}</span> 个目的地
          {filteredCount < totalResults && (
            <span>（共 {totalResults} 个）</span>
          )}
          <button
            onClick={() => { onSearchChange(''); onTagChange(null); }}
            className="ml-2 text-muted-foreground hover:text-foreground smooth-transition underline"
          >
            清除筛选
          </button>
        </div>
      )}
    </section>
  );
}
