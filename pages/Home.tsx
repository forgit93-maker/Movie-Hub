import React, { useEffect, useState } from 'react';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import HeroCarousel from '../components/HeroCarousel';
import MovieRow from '../components/MovieRow';

const Home: React.FC = () => {
  const [heroItems, setHeroItems] = useState<Movie[]>([]);
  const [trendingNow, setTrendingNow] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [hero, trendDay, popMov, popTV] = await Promise.all([
          tmdbService.getTrending('all', 'week'), // Hero: Trending All (Week)
          tmdbService.getTrending('all', 'day'),  // Row: Trending All (Day)
          tmdbService.getPopularMovies(),
          tmdbService.getPopularTV(),
        ]);

        setHeroItems(hero.slice(0, 10));
        setTrendingNow(trendDay);
        setPopularMovies(popMov);
        setPopularTV(popTV);
      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20">
      {/* Hero Carousel: Mixed Content */}
      <HeroCarousel items={heroItems} loading={loading} />

      {/* Discovery Rows */}
      <div className="relative z-10 mt-12 space-y-12 pl-6 md:pl-12">
        <MovieRow title="Trending Now" movies={trendingNow} loading={loading} />
        <MovieRow title="Popular Movies" movies={popularMovies} loading={loading} />
        <MovieRow title="Popular TV Shows" movies={popularTV} loading={loading} />
      </div>
    </div>
  );
};

export default Home;