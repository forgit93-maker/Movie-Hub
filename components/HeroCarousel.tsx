
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '../types';
import { getImageUrl } from '../services/tmdb';
import { Star, ChevronRight, ChevronLeft } from 'lucide-react';

const triggerPopunder = () => {
  const SCRIPT_URL = 'https://awkwardmonopoly.com/54/42/28/544228badfcc4c2bfc0469db956fed8d.js';
  if (!document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    document.body.appendChild(script);
  }
};

interface HeroCarouselProps {
  items: Movie[];
  loading?: boolean;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ items, loading = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (loading || !items || items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items, loading]);

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  if (loading) {
    return (
      <div className="relative h-[65vh] md:h-[85vh] w-full bg-gray-900 animate-pulse overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-full flex items-end z-20">
             <div className="px-6 pb-12 md:px-16 md:pb-20 space-y-4 max-w-4xl w-full">
                <div className="h-8 md:h-16 bg-gray-800 rounded w-3/4"></div>
                <div className="flex space-x-3">
                    <div className="h-6 w-16 bg-gray-800 rounded"></div>
                    <div className="h-6 w-16 bg-gray-800 rounded"></div>
                </div>
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-2/3"></div>
             </div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="relative h-[65vh] md:h-[85vh] w-full overflow-hidden group bg-dark">
      {items.map((item, index) => (
        <Link
          to={`/details/${item.media_type || 'movie'}/${item.id}`}
          onClick={triggerPopunder}
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
           {/* Background Image */}
           <div className="absolute inset-0">
             <img
               src={getImageUrl(item.backdrop_path, 'original')}
               alt={item.title || item.name}
               className="w-full h-full object-cover"
             />
             {/* Stronger gradient for better text readability */}
             <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-r from-dark/80 via-transparent to-transparent opacity-60" />
           </div>

           {/* Content - Pushed to bottom for mobile optimization */}
           <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
             <div className="px-6 pb-12 md:px-16 md:pb-20 space-y-2 md:space-y-4 max-w-4xl w-full">
                {/* Title */}
                <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white drop-shadow-2xl leading-tight animate-fade-in-up">
                  {item.title || item.name}
                </h1>
                
                {/* Meta Data */}
                <div className="flex items-center space-x-3 text-gray-300 text-xs sm:text-sm md:text-base animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <span className="flex items-center text-yellow-400 font-bold bg-black/40 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                      <Star size={14} className="mr-1 fill-current" />
                      {item.vote_average.toFixed(1)}
                    </span>
                    <span className="font-medium drop-shadow-md text-gray-200">
                      {item.release_date || item.first_air_date ? new Date(item.release_date || item.first_air_date!).getFullYear() : 'N/A'}
                    </span>
                    <span className="uppercase border border-gray-400/50 px-2 py-0.5 rounded text-[10px] sm:text-xs tracking-wider bg-black/20">
                      {item.media_type === 'tv' ? 'TV Series' : 'Movie'}
                    </span>
                </div>
                
                {/* Overview - Truncated heavily on mobile */}
                <p className="text-gray-300 text-xs sm:text-sm md:text-lg line-clamp-2 md:line-clamp-3 drop-shadow-md animate-fade-in-up max-w-xl" style={{ animationDelay: '0.2s' }}>
                  {item.overview}
                </p>
             </div>
           </div>
        </Link>
      ))}
      
      {/* Controls - Only visible on desktop hover to keep mobile clean */}
      <button onClick={prevSlide} className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/20 hover:bg-primary/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 backdrop-blur-sm border border-white/10">
        <ChevronLeft size={32} />
      </button>
      <button onClick={nextSlide} className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/20 hover:bg-primary/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 backdrop-blur-sm border border-white/10">
        <ChevronRight size={32} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:bottom-8 md:right-16 z-20 flex space-x-2 md:space-x-3">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1 md:h-1.5 rounded-full transition-all duration-300 shadow-sm ${
              idx === currentIndex ? 'bg-primary w-6 md:w-8' : 'bg-gray-500/50 w-3 md:w-4 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
