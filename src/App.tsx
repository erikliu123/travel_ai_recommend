import { useState, useCallback } from 'react';
import type { SeasonKey, CityInfo } from '@/data/cities';
import HeroBanner from '@/components/HeroBanner';
import SeasonNav from '@/components/SeasonNav';
import CityGrid from '@/components/CityGrid';
import CityModal from '@/components/CityModal';
import Footer from '@/components/Footer';

function App() {
  const [activeSeason, setActiveSeason] = useState<SeasonKey>('spring');
  const [selectedCity, setSelectedCity] = useState<CityInfo | null>(null);

  const handleSeasonChange = useCallback((season: SeasonKey) => {
    setActiveSeason(season);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCityClick = useCallback((city: CityInfo) => {
    setSelectedCity(city);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedCity(null);
  }, []);

  return (
    <div className="min-h-screen bg-background" data-season={activeSeason}>
      <SeasonNav activeSeason={activeSeason} onSeasonChange={handleSeasonChange} />
      <main>
        <HeroBanner season={activeSeason} />
        <CityGrid season={activeSeason} onCityClick={handleCityClick} />
      </main>
      <Footer />
      <CityModal city={selectedCity} onClose={handleCloseModal} />
    </div>
  );
}

export default App;
