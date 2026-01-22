
import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { useNavigate, Link } from 'react-router-dom';

const Favorites: React.FC = () => {
  const { user, watchlist } = useStore();
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchWatchlist = async () => {
      setIsLoading(true);
      try {
        // Fetch details for each ID in the watchlist
        const promises = watchlist.map(id => 
          tmdbService.getDetails('movie', id)
            .catch(() => tmdbService.getDetails('tv', id))
            .catch(() => null)
        );
        
        const results = await Promise.all(promises);
        // Filter out failed fetches (nulls) and cast to Movie type
        const movies = results.filter(m => m !== null) as unknown as Movie[];
        setWatchlistMovies(movies);
      } catch (error: any) {
        console.error("Error fetching watchlist:", error?.message || String(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchlist();
  }, [user, watchlist, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 px-6 md:px-12 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
          My Watchlist
          <span className="ml-4 text-base font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {watchlist.length} items
          </span>
        </h1>

        {isLoading ? (
          <div className="text-gray-500 dark:text-gray-400">Loading your list...</div>
        ) : watchlistMovies.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
             <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">Your watchlist is currently empty.</p>
             <Link to="/" className="px-6 py-3 bg-primary text-white rounded font-bold hover:bg-red-700 transition shadow-lg shadow-primary/20">
               Explore Movies & TV
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {watchlistMovies.map(movie => (
               <div key={movie.id} className="w-full">
                  <MovieCard movie={movie} featured />
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
