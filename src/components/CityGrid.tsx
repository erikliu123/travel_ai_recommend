import { useState, useMemo } from 'react';
import { allCities, seasonCities, type SeasonKey, type CityInfo } from '@/data/cities';
import CityCard from './CityCard';
import SearchFilter from './SearchFilter';

interface CityGridProps {
  season: SeasonKey;
  onCityClick: (city: CityInfo) => void;
  visitedCities?: Set<string>;
}

const ITEMS_PER_PAGE = 8;

export default function CityGrid({ season, onCityClick, visitedCities = new Set() }: CityGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const cityIds = seasonCities[season];
  const allCitiesForSeason = cityIds.map((id) => allCities[id]).filter(Boolean) as CityInfo[];

  // Collect all available tags for this season
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    allCitiesForSeason.forEach((city) => {
      city.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [allCitiesForSeason]);

  // Filter cities
  const filteredCities = useMemo(() => {
    return allCitiesForSeason.filter((city) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = city.name.toLowerCase().includes(query);
        const matchProvince = city.province.toLowerCase().includes(query);
        const matchDesc = city.description.toLowerCase().includes(query);
        const matchAttractions = city.attractions.some((a) =>
          a.name.toLowerCase().includes(query) || a.description.toLowerCase().includes(query)
        );
        if (!matchName && !matchProvince && !matchDesc && !matchAttractions) return false;
      }

      // Tag filter
      if (activeTag && !city.tags?.includes(activeTag)) return false;

      return true;
    });
  }, [allCitiesForSeason, searchQuery, activeTag]);

  // Pagination
  const totalPages = Math.ceil(filteredCities.length / ITEMS_PER_PAGE);
  const paginatedCities = filteredCities.slice(0, currentPage * ITEMS_PER_PAGE);
  const hasMore = currentPage < totalPages;

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleTagChange = (tag: string | null) => {
    setActiveTag(tag);
    setCurrentPage(1);
  };

  // Reset when season changes (detected by key change in parent)
  useMemo(() => {
    setCurrentPage(1);
    setSearchQuery('');
    setActiveTag(null);
  }, [season]);

  return (
    <div>
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        activeTag={activeTag}
        onTagChange={handleTagChange}
        availableTags={availableTags}
        totalResults={allCitiesForSeason.length}
        filteredCount={filteredCities.length}
      />

      <section className="max-w-7xl mx-auto px-4 pb-8">
        {paginatedCities.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">没有找到匹配的目的地</p>
            <p className="text-muted-foreground text-sm mt-2">试试其他搜索词或筛选条件</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {paginatedCities.map((city, index) => (
                <CityCard
                  key={city.id}
                  city={city}
                  onClick={onCityClick}
                  index={index}
                  isVisited={visitedCities.has(city.id)}
                />
              ))}
            </div>

            {/* Load more button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-6 py-2.5 rounded-full bg-card border border-border text-sm font-medium hover:bg-muted smooth-transition card-shadow hover:shadow-md"
                >
                  加载更多（剩余 {filteredCities.length - paginatedCities.length} 个）
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
