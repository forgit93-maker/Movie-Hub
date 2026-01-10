import React, { useEffect, useState } from 'react';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import HeroCarousel from '../components/HeroCarousel';
import MovieRow from '../components/MovieRow';

const TVSeries: React.FC = () => {
  const [heroItems, setHeroItems] = useState<Movie[]>([]);
  const [trendingNow, setTrendingNow] = useState<Movie[]>([]);
  const [dramaSeries, setDramaSeries] = useState<Movie[]>([]);
  const [thrillerSeries, setThrillerSeries] = useState<Movie[]>([]); // 10768
  const [crimeSeries, setCrimeSeries] = useState<Movie[]>([]); // 80
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [hero, trendDay, drama, thriller, crime] = await Promise.all([
          tmdbService.getTrending('tv', 'week'), // Hero: Trending TV (Week)
          tmdbService.getTrending('tv', 'day'),  // Row: Trending TV (Day)
          tmdbService.getTVByGenre(18),          // Drama (18)
          tmdbService.getTVByGenre(10768),       // War & Politics (Request: Thriller)
          tmdbService.getTVByGenre(80),          // Crime (80)
        ]);

        setHeroItems(hero.slice(0, 10));
        setTrendingNow(trendDay);
        setDramaSeries(drama);
        setThrillerSeries(thriller);
        setCrimeSeries(crime);
      } catch (error) {
        console.error("Failed to load TV data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20">
      {/* Hero: Weekly Trending TV */}
      <HeroCarousel items={heroItems} loading={loading} />

      <div className="relative z-10 mt-12 space-y-12 pl-6 md:pl-12">
        <MovieRow title="Trending TV Series Now" movies={trendingNow} loading={loading} />
        <MovieRow title="Acclaimed Dramas" movies={dramaSeries} loading={loading} />
        <MovieRow title="Politics & Thrillers" movies={thrillerSeries} loading={loading} />
        <MovieRow title="True Crime & Mystery" movies={crimeSeries} loading={loading} />
      </div>
    </div>
  );
};

export default TVSeries;