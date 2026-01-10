import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Check } from 'lucide-react';
import { Movie } from '../types';
import { getImageUrl } from '../services/tmdb';
import { useStore } from '../context/StoreContext';

interface MovieCardProps {
  movie: Movie;
  featured?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, featured = false }) => {
  const { isWatchlisted, addToWatchlist, removeFromWatchlist, user } = useStore();
  const inWatchlist = isWatchlisted(movie.id);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
        alert("Please login to use watchlist");
        return;
    }
    if (inWatchlist) removeFromWatchlist(movie.id);
    else addToWatchlist(movie.id);
  };

  const title = movie.title || movie.name || 'Untitled';
  
  // Logic to fetch year (Movies: release_date, TV: first_air_date)
  const rawDate = movie.release_date || movie.first_air_date;
  const year = rawDate ? rawDate.split('-')[0] : 'N/A';
  
  const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');

  return (
    <div className={`relative group ${featured ? 'w-full h-full' : 'w-[160px] md:w-[200px] flex-shrink-0'}`}>
       <Link to={`/details/${mediaType}/${movie.id}`} className="block h-full">
        <div className={`relative overflow-hidden rounded-md transition-all duration-300 ${featured ? 'aspect-video' : 'aspect-[2/3]'} bg-gray-200 dark:bg-gray-800 shadow-sm`}>
          <img
            src={getImageUrl(featured ? movie.backdrop_path : movie.poster_path, featured ? 'original' : 'w500')}
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="text-white font-bold text-sm md:text-base leading-tight mb-1 truncate">{title}</h3>
            
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span className="flex items-center text-green-400">
                <Star size={12} className="mr-1 fill-current" />
                {movie.vote_average.toFixed(1)}
              </span>
              <span className="text-white/80 font-medium">{year}</span>
            </div>
            
            <div className="mt-3 flex gap-2">
               <button 
                onClick={toggleWatchlist}
                className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm py-1 rounded flex items-center justify-center text-white transition-colors border border-white/20"
               >
                 {inWatchlist ? <Check size={16} /> : <Plus size={16} />}
               </button>
            </div>
          </div>
        </div>
       </Link>
       
       {/* Info Section Below Poster - Visible on all screens for non-featured cards */}
       {!featured && (
         <div className="mt-2">
            <h3 className="text-gray-900 dark:text-white font-bold text-base truncate" title={title}>{title}</h3>
            {/* Year styled as text-sm text-gray-400 for clarity */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{year}</p>
         </div>
       )}
    </div>
  );
};

export default MovieCard;