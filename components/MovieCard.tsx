import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, PlayCircle } from 'lucide-react';
import { Movie } from '../types';
import { getImageUrl } from '../services/tmdb';

interface MovieCardProps {
  movie: Movie;
  featured?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, featured = false }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const title = movie.title || movie.name || 'Untitled';
  const rawDate = movie.release_date || movie.first_air_date;
  const year = rawDate ? rawDate.split('-')[0] : '';
  const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');

  const handleCardClick = () => {
    // Basic "pop" sound using Web Audio API to avoid external file dependencies
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // Frequency 800Hz
        oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1); // Drop to 300Hz

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
        // Silently fail if audio context not supported or blocked
    }
  };

  return (
    <div className={`relative group w-full ${featured ? 'h-full' : 'w-[140px] md:w-[180px] flex-shrink-0'}`}>
      <Link 
        to={`/details/${mediaType}/${movie.id}`} 
        className="block h-full"
        onClick={handleCardClick}
      >
        {/* Card Container */}
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900 shadow-md">
           
           {/* Skeleton Loader */}
           {!isImageLoaded && (
             <div className="absolute inset-0 bg-gray-800 animate-pulse" />
           )}

           {/* Poster Image */}
           <img
             src={getImageUrl(movie.poster_path, 'w500')}
             alt={title}
             loading="lazy"
             className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
             onLoad={() => setIsImageLoaded(true)}
           />

           {/* Rating Badge (Top Right) */}
           <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10 shadow-sm z-10">
             <Star size={10} className="text-yellow-400 fill-yellow-400" />
             <span className="text-[10px] font-bold text-white">{movie.vote_average?.toFixed(1)}</span>
           </div>

           {/* Gradient Overlay (Bottom) */}
           <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col justify-end p-3 z-10">
             
             {/* Title */}
             <h3 className="text-white font-bold text-xs md:text-sm leading-tight truncate">
               {title}
             </h3>
             
             {/* Metadata Row */}
             <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400 font-medium">
               <span>{year}</span>
               <span className="w-0.5 h-0.5 bg-gray-500 rounded-full"></span>
               <span className="uppercase">{mediaType === 'tv' ? 'TV' : 'Movie'}</span>
             </div>
           </div>

           {/* Hover Play Icon */}
           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 z-0">
             <PlayCircle size={40} className="text-white/90 fill-white/20 drop-shadow-lg" />
           </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;