import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import YouTube from 'react-youtube';
import { tmdbService, getImageUrl } from '../services/tmdb';
import { MovieDetails as MovieDetailsType } from '../types';
import { useStore } from '../context/StoreContext';
import { Star, Clock, PlayCircle, ArrowLeft, Plus, Check, X, ExternalLink } from 'lucide-react';
import MovieCard from '../components/MovieCard';

const Details: React.FC = () => {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const [data, setData] = useState<MovieDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentBackdropIndex, setCurrentBackdropIndex] = useState(0);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const { user, addToWatchlist, removeFromWatchlist, isWatchlisted } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (type && id) {
        try {
          const result = await tmdbService.getDetails(type, parseInt(id));
          setData(result);
        } catch (error) {
          console.error(error);
        }
      }
      setLoading(false);
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [type, id]);

  // Backdrops Slider Interval
  useEffect(() => {
    if (!data || !data.images?.backdrops?.length) return;
    
    // Use top 5 images or all if less than 5
    const maxImages = Math.min(data.images.backdrops.length, 5);
    
    const interval = setInterval(() => {
      setCurrentBackdropIndex(prev => (prev + 1) % maxImages);
    }, 6000); // Rotate every 6 seconds

    return () => clearInterval(interval);
  }, [data]);

  if (loading) return <div className="h-screen flex items-center justify-center dark:text-white text-gray-900">Loading details...</div>;
  if (!data) return <div className="h-screen flex items-center justify-center dark:text-white text-gray-900">Content not found.</div>;

  // Prioritize YouTube Trailers
  const trailer = data.videos.results.find(v => v.site === "YouTube" && v.type === "Trailer") 
               || data.videos.results.find(v => v.site === "YouTube");
               
  const director = data.credits.crew.find(c => c.job === "Director")?.name;
  const year = new Date(data.release_date || data.first_air_date || '').getFullYear();
  const inWatchlist = isWatchlisted(data.id);
  
  // Backdrops logic
  const backdropImages = data.images.backdrops.length > 0 
    ? data.images.backdrops.slice(0, 5) 
    : [{ file_path: data.backdrop_path }];

  const toggleWatchlist = () => {
    if (!user) {
      alert("Please login to manage your watchlist.");
      return;
    }
    if (inWatchlist) removeFromWatchlist(data.id);
    else addToWatchlist(data.id);
  };

  // React Youtube Options
  const opts: any = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      origin: window.location.origin, // Fix for Error 153
      enablejsapi: 1,
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-20 md:pb-0 relative transition-colors duration-300">
      
      {/* Hero Section with Slider & Back Button */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden group bg-black">
        
        {/* 
            Back Button:
            - Small (w-8 h-8)
            - Circular
            - Dark Glassmorphism (bg-black/60, backdrop-blur-md, border-white/20)
            - Position: top-20 left-4 (Absolute to container, so it scrolls)
        */}
        <Link 
          to={type === 'tv' ? '/tv' : '/movies'}
          className="absolute top-20 left-4 z-30 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-lg shadow-black/50 hover:bg-black/80 transition-all duration-300 group-hover:scale-105"
        >
          <ArrowLeft size={16} className="text-white" />
        </Link>

        {/* Image Slider */}
        {backdropImages.map((img, index) => (
           <div 
             key={img.file_path}
             className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${index === currentBackdropIndex ? 'opacity-100' : 'opacity-0'}`}
           >
             <img 
               src={getImageUrl(img.file_path, 'original')} 
               alt="" 
               className="w-full h-full object-cover"
             />
             {/* Gradient matches the theme background at the bottom */}
             <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent"></div>
             <div className="absolute inset-0 bg-black/20"></div>
           </div>
        ))}
        
        {/* Title & Metadata Overlay (Always Light Text over Image) */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
           <h1 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-2xl mb-3 md:mb-4 text-white">
             {data.title || data.name} <span className="text-gray-300 font-light text-xl md:text-3xl">({year})</span>
           </h1>
           
           <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-200">
              <span className="flex items-center text-yellow-400 font-bold bg-black/40 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                <Star size={14} className="mr-1 fill-current"/> {data.vote_average.toFixed(1)}
              </span>
              {data.runtime && (
                <span className="flex items-center bg-black/20 px-2 py-1 rounded backdrop-blur-sm text-white">
                  <Clock size={14} className="mr-1"/> {Math.floor(data.runtime / 60)}h {data.runtime % 60}m
                </span>
              )}
              <span className="hidden sm:inline text-gray-400">|</span>
              <div className="flex flex-wrap gap-2">
                {data.genres.slice(0, 3).map(g => (
                  <span key={g.id} className="bg-black/40 text-white px-2 py-0.5 rounded text-[10px] md:text-xs backdrop-blur-sm border border-white/5">{g.name}</span>
                ))}
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        
        {/* Overview Section */}
        <div className="max-w-4xl">
           <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Overview</h3>
           <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base md:text-lg font-light">
             {data.overview}
           </p>
           {director && (
             <div className="mt-4 flex items-center gap-2">
               <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Director</span>
               <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
               <p className="text-primary font-medium">{director}</p>
             </div>
           )}
        </div>

        {/* Top Cast Section (Horizontal Scroll) */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-primary pl-3">Top Cast</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar">
            {data.credits.cast.slice(0, 15).map(actor => (
              <div key={actor.id} className="flex-shrink-0 w-24 md:w-28 text-center group">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-800 group-hover:border-primary transition-colors duration-300 mb-2 mx-auto shadow-lg relative">
                   {actor.profile_path ? (
                     <img 
                       src={getImageUrl(actor.profile_path)} 
                       alt={actor.name} 
                       className="w-full h-full object-cover"
                       loading="lazy"
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-gray-200 dark:bg-gray-800">
                        {actor.name[0]}
                     </div>
                   )}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate px-1">{actor.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate px-1">{actor.character}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons (Strictly BELOW Cast) */}
        <section className="flex flex-col sm:flex-row gap-4 border-t border-gray-200 dark:border-gray-800 pt-8">
           {trailer && (
             <button 
               onClick={() => {
                 setVideoError(false);
                 setIsTrailerOpen(true);
               }}
               className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-red-700 text-white font-bold rounded-lg transition-transform transform hover:scale-105 shadow-lg shadow-primary/20"
             >
               <PlayCircle size={20} className="mr-2" /> Watch Trailer
             </button>
           )}
           
           <button 
             onClick={toggleWatchlist}
             className={`flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 font-bold rounded-lg transition-all duration-300 border ${inWatchlist ? 'bg-green-600 border-green-600 text-white' : 'bg-transparent border-gray-400 dark:border-gray-600 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}
           >
             {inWatchlist ? <Check size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
             {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
           </button>
        </section>

        {/* More Like This (Horizontal Scroll) */}
        {data.similar.results.length > 0 && (
          <section className="pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white border-l-4 border-primary pl-3">More Like This</h2>
             <div className="flex space-x-4 overflow-x-auto pb-6 hide-scrollbar">
                {data.similar.results.map((movie) => (
                    <div key={movie.id} className="w-[150px] md:w-[200px] flex-shrink-0">
                       <MovieCard movie={{...movie, media_type: type === 'tv' ? 'tv' : 'movie'}} />
                    </div>
                ))}
             </div>
          </section>
        )}
      </div>

      {/* Trailer Modal with react-youtube - KEEPING DARK BACKDROP for cinema feel */}
      {isTrailerOpen && trailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in-up">
           {/* Click outside to close */}
           <div className="absolute inset-0" onClick={() => setIsTrailerOpen(false)}></div>
           
           <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col justify-center items-center">
             {/* Close Button */}
             <button 
               onClick={() => setIsTrailerOpen(false)}
               className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-md transition-colors border border-white/10"
             >
               <X size={24} />
             </button>

             {/* Player Logic */}
             {!videoError ? (
               <YouTube
                 videoId={trailer.key}
                 opts={opts}
                 className="w-full h-full"
                 iframeClassName="w-full h-full"
                 onError={(e) => {
                   console.error("YouTube Player Error:", e);
                   setVideoError(true);
                 }}
               />
             ) : (
               <div className="flex flex-col items-center text-center p-8 space-y-4">
                  <div className="p-4 bg-gray-800 rounded-full text-gray-400 mb-2">
                    <PlayCircle size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Trailer Unavailable Here</h3>
                  <p className="text-gray-400 max-w-md">
                    This video contains content that is restricted from being played on this site (Error 153).
                  </p>
                  <a 
                    href={`https://www.youtube.com/watch?v=${trailer.key}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center px-6 py-3 bg-primary text-white font-bold rounded hover:bg-red-700 transition"
                  >
                    Watch on YouTube <ExternalLink size={18} className="ml-2"/>
                  </a>
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
};

export default Details;