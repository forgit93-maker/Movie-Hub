import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, watchlist } = useStore();
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchWatchlist = async () => {
      // In a real app, this would be a single backend call.
      // Here we fetch details for each ID.
      const promises = watchlist.map(id => tmdbService.getDetails('movie', id).catch(() => tmdbService.getDetails('tv', id)));
      const results = await Promise.all(promises);
      // Filter out failed fetches (nulls) and cast to Movie
      const movies = results.filter(m => m !== null) as unknown as Movie[];
      setWatchlistMovies(movies);
    };

    fetchWatchlist();
  }, [user, watchlist, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-dark pt-24 px-6 md:px-12 pb-12 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-6 mb-12 border-b border-gray-800 pb-8">
           <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl font-bold">
             {user.name[0].toUpperCase()}
           </div>
           <div>
             <h1 className="text-3xl font-bold">{user.name}</h1>
             <p className="text-gray-400">{user.email}</p>
             <p className="text-gray-500 mt-2">Member since 2024</p>
           </div>
        </div>

        <h2 className="text-2xl font-bold mb-6 flex items-center">
          My Watchlist 
          <span className="ml-3 bg-gray-800 text-sm py-1 px-3 rounded-full text-gray-300">{watchlist.length} items</span>
        </h2>
        
        {watchlistMovies.length === 0 ? (
          <div className="text-center py-20 bg-gray-900 rounded-lg border border-gray-800">
             <p className="text-gray-400 text-lg mb-4">Your watchlist is empty.</p>
             <button onClick={() => navigate('/')} className="px-6 py-2 bg-primary rounded text-white font-medium hover:bg-red-700">Explore Movies</button>
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

export default Profile;
