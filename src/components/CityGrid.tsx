import { allCities, seasonCities, type SeasonKey, type CityInfo } from '@/data/cities';
import CityCard from './CityCard';

interface CityGridProps {
  season: SeasonKey;
  onCityClick: (city: CityInfo) => void;
}

export default function CityGrid({ season, onCityClick }: CityGridProps) {
  const cityIds = seasonCities[season];
  const cities = cityIds.map((id) => allCities[id]).filter(Boolean);

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {cities.map((city, index) => (
          <CityCard
            key={city.id}
            city={city}
            onClick={onCityClick}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
