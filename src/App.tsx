import { useState, useCallback, useEffect } from 'react';
import type { SeasonKey, CityInfo } from '@/data/cities';
import HeroBanner from '@/components/HeroBanner';
import SeasonNav from '@/components/SeasonNav';
import CityGrid from '@/components/CityGrid';
import CityModal from '@/components/CityModal';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import AuthModal from '@/components/AuthModal';
import AIGuides from '@/components/AIGuides';
import type { User as UserType, Trip } from '@/types';
import { api } from '@/lib/api';

function App() {
  const [activeSeason, setActiveSeason] = useState<SeasonKey>('spring');
  const [selectedCity, setSelectedCity] = useState<CityInfo | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [visitedCities, setVisitedCities] = useState<Set<string>>(new Set());
  const [userTrips, setUserTrips] = useState<Record<string, Trip>>({});
  const [activeView, setActiveView] = useState<'seasons' | 'guides'>('seasons');

  // Check for existing session on mount
  useEffect(() => {
    // Handle QQ login callback
    const urlParams = new URLSearchParams(window.location.search);
    const qqToken = urlParams.get('qq_token');
    const qqError = urlParams.get('error');

    if (qqError) {
      // QQ login failed
      alert('QQ 登录失败，请重试');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (qqToken) {
      // QQ login success
      localStorage.setItem('auth_token', qqToken);
      api.getMe()
        .then(({ user }) => {
          setUser(user);
          return api.getTrips();
        })
        .then(({ trips }) => {
          const visited = new Set<string>();
          const tripMap: Record<string, Trip> = {};
          trips.forEach((trip) => {
            visited.add(trip.city_id);
            tripMap[trip.city_id] = trip;
          });
          setVisitedCities(visited);
          setUserTrips(tripMap);
        })
        .catch(() => {
          api.logout();
        });
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // Normal session check
    const token = localStorage.getItem('auth_token');
    if (token) {
      api.getMe()
        .then(({ user }) => {
          setUser(user);
          return api.getTrips();
        })
        .then(({ trips }) => {
          const visited = new Set<string>();
          const tripMap: Record<string, Trip> = {};
          trips.forEach((trip) => {
            visited.add(trip.city_id);
            tripMap[trip.city_id] = trip;
          });
          setVisitedCities(visited);
          setUserTrips(tripMap);
        })
        .catch(() => {
          api.logout();
        });
    }
  }, []);

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

  const handleLogin = useCallback((loggedInUser: UserType) => {
    setUser(loggedInUser);
    api.getTrips().then(({ trips }) => {
      const visited = new Set<string>();
      const tripMap: Record<string, Trip> = {};
      trips.forEach((trip) => {
        visited.add(trip.city_id);
        tripMap[trip.city_id] = trip;
      });
      setVisitedCities(visited);
      setUserTrips(tripMap);
    });
  }, []);

  const handleLogout = useCallback(() => {
    api.logout();
    setUser(null);
    setVisitedCities(new Set());
    setUserTrips({});
  }, []);

  const handleTripSuccess = useCallback((trip: Trip) => {
    setVisitedCities((prev) => {
      const next = new Set(prev);
      next.add(trip.city_id);
      return next;
    });
    setUserTrips((prev) => ({ ...prev, [trip.city_id]: trip }));
  }, []);

  const handleTripDelete = useCallback((cityId: string) => {
    setVisitedCities((prev) => {
      const next = new Set(prev);
      next.delete(cityId);
      return next;
    });
    setUserTrips((prev) => {
      const next = { ...prev };
      delete next[cityId];
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-background" data-season={activeSeason}>
      <SeasonNav
        activeSeason={activeSeason}
        onSeasonChange={handleSeasonChange}
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuth(true)}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <main>
        {activeView === 'guides' ? (
          <AIGuides />
        ) : (
          <>
            <HeroBanner season={activeSeason} />
            <CityGrid
              season={activeSeason}
              onCityClick={handleCityClick}
              visitedCities={visitedCities}
            />
          </>
        )}
      </main>
      <Footer />
      <CityModal
        city={selectedCity}
        onClose={handleCloseModal}
        user={user}
        trip={selectedCity ? userTrips[selectedCity.id] : null}
        onTripSuccess={handleTripSuccess}
        onTripDelete={handleTripDelete}
        onLoginClick={() => setShowAuth(true)}
      />
      <ScrollToTop />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={handleLogin} />}
    </div>
  );
}

export default App;
