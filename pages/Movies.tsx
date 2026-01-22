
import React, { useEffect, useState } from 'react';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import HeroCarousel from '../components/HeroCarousel';
import MovieRow from '../components/MovieRow';

const Movies: React.FC = () => {
  const [heroItems, setHeroItems] = useState<Movie[]>([]);
  const [trendingNow, setTrendingNow] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [dramaMovies, setDramaMovies] = useState<Movie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [hero, trendDay, action, drama, comedy] = await Promise.all([
          tmdbService.getTrending('movie', 'week'), // Hero
          tmdbService.getTrending('movie', 'day'),  // Trending Now
          tmdbService.getMoviesByGenre(28),         // Action (28)
          tmdbService.getMoviesByGenre(18),         // Drama (18)
          tmdbService.getMoviesByGenre(35),         // Comedy (35)
        ]);

        setHeroItems(hero.slice(0, 10));
        setTrendingNow(trendDay);
        setActionMovies(action);
        setDramaMovies(drama);
        setComedyMovies(comedy);
      } catch (error: any) {
        console.error("Failed to load movies data:", error?.message || String(error));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20 transition-colors duration-300">
      {/* Hero: Weekly Trending Movies */}
      <HeroCarousel items={heroItems} loading={loading} />

      <div className="relative z-10 mt-12 space-y-12 pl-6 md:pl-12">
        <MovieRow title="Trending Movies Now" movies={trendingNow} loading={loading} />
        <MovieRow title="Action Blockbusters" movies={actionMovies} loading={loading} />
        <MovieRow title="Dramatic Hits" movies={dramaMovies} loading={loading} />
        <MovieRow title="Comedy Favorites" movies={comedyMovies} loading={loading} />
      </div>
    </div>
  );
};

export default Movies;
