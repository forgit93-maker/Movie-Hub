
import React, { useEffect, useState, useCallback } from 'react';
import * as ReactRouterDom from 'react-router-dom';
import YouTube from 'react-youtube';
import { Helmet } from 'react-helmet-async';
import { tmdbService, getImageUrl } from '../services/tmdb';
import { MovieDetails as MovieDetailsType, Episode, Movie, Image as TMDBImage } from '../types';
import { 
  Star, Clock, PlayCircle, X, LayoutGrid, Heart, Share2, 
  Play, Users, Film 
} from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import MovieDetailsLoader from '../components/MovieDetailsLoader';
import MovieCard from '../components/MovieCard';

const triggerPopunder = () => {
  const SCRIPT_URL = 'https://awkwardmonopoly.com/54/42/28/544228badfcc4c2bfc0469db956fed8d.js';
  if (!document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    document.body.appendChild(script);
  }
};

export default function Details() {
  const { type, id } = ReactRouterDom.useParams<{ type: 'movie' | 'tv'; id: string }>();
  const [data, setData] = useState<MovieDetailsType | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showPlayer, setShowPlayer] = useState(false);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [currentEpisodes, setCurrentEpisodes] = useState<Episode[]>([]);

  // Backdrop Carousel State
  const [backdrops, setBackdrops] = useState<TMDBImage[]>([]);
  const [currentBackdropIndex, setCurrentBackdropIndex] = useState(0);

  const isAnime = data?.genres?.some(g => g.name.toLowerCase().includes('anime') || g.id === 16);
  const isYouTubeContent = id?.startsWith('yt_');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setShowPlayer(false); 
      if (type && id) {
        if (id.startsWith('yt_')) {
          setLoading(false);
          return;
        }
        try {
          const numericId = parseInt(id);
          const result = await tmdbService.getDetails(type, numericId);
          setData(result);
          setRecommendations(result.similar.results || []);
          
          // Initialize backdrops (filter for high quality)
          if (result.images?.backdrops) {
            const filteredBackdrops = result.images.backdrops.slice(0, 8);
            setBackdrops(filteredBackdrops.length > 0 ? filteredBackdrops : [{ file_path: result.backdrop_path } as TMDBImage]);
          } else {
            setBackdrops([{ file_path: result.backdrop_path } as TMDBImage]);
          }
          
          setSeason(1);
          setEpisode(1);
        } catch (error) {
          console.error("Failed to fetch details", error);
        }
      }
      setLoading(false);
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [type, id]);

  // Auto-Play Backdrop logic
  useEffect(() => {
    if (backdrops.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBackdropIndex((prev) => (prev + 1) % backdrops.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backdrops]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (type === 'tv' && id && !id.startsWith('yt_')) {
        const seasonDetails = await tmdbService.getSeasonDetails(parseInt(id), season);
        if (seasonDetails) setCurrentEpisodes(seasonDetails.episodes);
      }
    };
    fetchEpisodes();
  }, [type, id, season]);

  const handleWatchNow = () => {
    triggerPopunder();
    setShowPlayer(true);
    setTimeout(() => {
      const el = document.getElementById('video-player-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  };

  const handleTrailerClick = () => {
    triggerPopunder();
    setIsTrailerModalOpen(true);
  };

  if (loading || (!data && !isYouTubeContent)) return <MovieDetailsLoader />;

  const trailer = data?.videos.results.find(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));
  const year = data ? new Date(data.release_date || data.first_air_date || '').getFullYear() : 'N/A';
  const displayTitle = data ? (data.title || data.name || 'Untitled') : 'Transmission Content';
  
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-12 transition-colors duration-500">
      <Helmet><title>{`${displayTitle} (${year}) - MOVIE HUB`}</title></Helmet>
      
      {/* Auto-Live Backdrop Slider Section - Height increased to shift content down */}
      <div className="relative w-full h-[60vh] md:h-[80vh] lg:h-[90vh] bg-black overflow-hidden shadow-2xl">
        {backdrops.map((img, idx) => (
          <img 
            key={idx}
            src={getImageUrl(img.file_path, 'original')} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              idx === currentBackdropIndex ? 'opacity-70 md:opacity-50' : 'opacity-0'
            }`} 
            alt={`${displayTitle} background ${idx}`}
          />
        ))}

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 dark:from-black/40 via-transparent to-transparent" />
        
        {/* Hero Content - Positioned at bottom with increased padding for downward shift */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24 z-10 space-y-4 md:space-y-6">
           {/* Mobile-Compact Typography */}
           <h1 className="text-3xl md:text-6xl lg:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.85] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              {displayTitle} <span className="text-gray-300 font-light text-2xl md:text-4xl lg:text-5xl">({year})</span>
           </h1>
           
           <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4">
              <span className="flex items-center text-yellow-400 font-black bg-black/70 px-3 py-1 md:px-5 md:py-2 rounded-xl border border-white/10 text-[10px] md:text-sm shadow-xl backdrop-blur-md">
                <Star size={14} className="mr-1.5 fill-current"/> {data?.vote_average.toFixed(1) || 'N/A'}
              </span>
              <span className="flex items-center bg-white/15 px-3 py-1 md:px-5 md:py-2 rounded-xl text-white font-bold border border-white/10 text-[10px] md:text-sm backdrop-blur-xl shadow-xl">
                <Clock size={14} className="mr-1.5"/> {data?.runtime || '?'}M
              </span>
              {data?.genres?.slice(0, 2).map(g => (
                <span key={g.id} className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-white/90 bg-primary/30 border border-primary/40 px-3 py-1 md:px-5 md:py-2 rounded-full backdrop-blur-md">
                  {g.name}
                </span>
              ))}
           </div>

           <div className="flex items-center gap-3 md:gap-6">
              <button 
                onClick={handleWatchNow} 
                className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 md:px-12 md:py-5 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_10px_30px_-5px_rgba(229,9,20,0.5)] active:scale-95 transition-all text-[11px] md:text-sm"
              >
                <PlayCircle size={20} className="mr-2 md:mr-3.5" /> Watch Now
              </button>
              {trailer && (
                 <button 
                   onClick={handleTrailerClick} 
                   className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 md:px-12 md:py-5 bg-gray-600/30 border border-white/20 text-white font-black uppercase tracking-[0.2em] rounded-xl text-[11px] md:text-sm backdrop-blur-2xl transition-all active:scale-95 hover:bg-white/10 shadow-lg"
                 >
                    <Play size={18} className="mr-2 md:mr-3.5" /> Trailer
                 </button>
              )}
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 md:py-16 space-y-16 md:space-y-24">
        
        {/* Mission Briefing / Overview */}
        <div className="max-w-4xl space-y-4 md:space-y-8 animate-fade-in-up" onClick={triggerPopunder}>
           <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 md:w-2.5 md:h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(229,9,20,0.5)]" />
                 <h3 className="text-base md:text-xl font-black uppercase tracking-[0.3em] italic text-gray-900 dark:text-white cursor-pointer">Mission Briefing</h3>
              </div>
              <div className="flex gap-3 md:gap-5">
                 <button className="p-3 md:p-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-gray-600 dark:text-white hover:text-primary transition-all active:scale-90 shadow-sm"><Heart size={20} /></button>
                 <button className="p-3 md:p-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-gray-600 dark:text-white hover:text-cyan-500 transition-all active:scale-90 shadow-sm"><Share2 size={20} /></button>
              </div>
           </div>
           <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[13px] md:text-[18px] font-medium tracking-tight cursor-pointer">
             {data?.overview || "Intelligence data redacted."}
           </p>
        </div>

        {/* Cast Section */}
        {!isYouTubeContent && data && data.credits.cast.length > 0 && (
          <section className="space-y-8 md:space-y-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.4em] italic text-gray-900 dark:text-white flex items-center gap-3">
              <Users size={20} className="text-primary" /> Active Operatives
            </h3>
            <div className="flex space-x-6 md:space-x-10 overflow-x-auto pb-6 md:pb-10 hide-scrollbar px-2">
              {data.credits.cast.slice(0, 15).map(actor => (
                <ReactRouterDom.Link key={actor.id} to={`/actor/${actor.id}`} onClick={triggerPopunder} className="flex-shrink-0 w-24 md:w-32 text-center group">
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-gray-200 dark:border-white/10 group-hover:border-primary transition-all duration-700 mb-3 md:mb-5 mx-auto shadow-xl">
                     {actor.profile_path ? (
                       <img src={getImageUrl(actor.profile_path)} alt={actor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-400 font-black bg-gray-100 dark:bg-gray-900 text-[10px] md:text-xs uppercase italic">{actor.name[0]}</div>
                     )}
                  </div>
                  <h4 className="text-[10px] md:text-[12px] font-black text-gray-900 dark:text-white truncate uppercase tracking-tighter group-hover:text-primary transition-colors mb-1">{actor.name}</h4>
                  <p className="text-[9px] md:text-[10px] text-gray-500 truncate italic uppercase tracking-tighter">{actor.character}</p>
                </ReactRouterDom.Link>
              ))}
            </div>
          </section>
        )}

        {/* Video Player Segment */}
        {showPlayer && (
            <section className="pt-10 md:pt-20 border-t border-gray-100 dark:border-white/5 scroll-mt-24">
                <VideoPlayer 
                    tmdbId={data?.id as number || 0} 
                    type={type as 'movie' | 'tv'} 
                    season={season} 
                    episode={episode} 
                    isAnime={isAnime}
                />

                {/* TV Series Season & Episode Selection */}
                {type === 'tv' && !isYouTubeContent && (
                    <div className="mt-16 md:mt-24 space-y-8 md:space-y-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 md:pb-10 border-b border-gray-100 dark:border-white/5">
                            <h3 className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.3em] italic text-gray-900 dark:text-white flex items-center gap-3">
                              <LayoutGrid size={22} className="text-primary" /> Transmission Logs
                            </h3>
                            <select 
                                value={season} 
                                onChange={(e) => { setSeason(Number(e.target.value)); setEpisode(1); }} 
                                className="w-full md:w-auto bg-gray-100 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-xl px-6 py-3 font-black text-gray-900 dark:text-white outline-none text-[10px] uppercase tracking-widest cursor-pointer shadow-sm"
                            >
                                {data?.seasons?.filter(s => s.season_number > 0).map(s => <option key={s.id} value={s.season_number}>SEASON {s.season_number}</option>)}
                            </select>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] md:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {currentEpisodes.map(ep => (
                                <button 
                                  key={ep.id} 
                                  onClick={() => { setEpisode(ep.episode_number); document.getElementById('video-player-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} 
                                  className={`text-left flex gap-4 p-3 md:p-4 rounded-2xl border-2 transition-all duration-300 ${episode === ep.episode_number ? 'bg-primary/5 dark:bg-primary/10 border-primary shadow-lg ring-1 ring-primary/30' : 'bg-gray-50 dark:bg-white/5 border-transparent hover:border-gray-200 dark:hover:border-white/10'}`}
                                >
                                    <div className="relative shrink-0 w-24 md:w-40 h-16 md:h-24 rounded-lg md:rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-md">
                                        <img src={getImageUrl(ep.still_path, 'w500')} alt={ep.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 overflow-hidden flex flex-col justify-center">
                                        <h4 className={`text-[11px] md:text-[14px] font-black uppercase italic tracking-tight truncate ${episode === ep.episode_number ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                                            EP.{ep.episode_number} - {ep.name}
                                        </h4>
                                        <p className="text-[10px] md:text-[12px] text-gray-500 line-clamp-2 mt-1 font-medium leading-tight">
                                          {ep.overview || "Narrative data unavailable."}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        )}

        {/* Similar Recommendations */}
        {!isYouTubeContent && recommendations.length > 0 && (
          <section className="pt-10 md:pt-20 border-t border-gray-100 dark:border-white/5 animate-fade-in-up">
            <h3 className="text-[12px] md:text-[13px] font-black uppercase tracking-[0.4em] italic text-gray-900 dark:text-white mb-8 md:mb-12 flex items-center gap-3">
              <Film size={20} className="text-primary" /> Data Similarities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-10">
              {recommendations.slice(0, 12).map(movie => (
                <MovieCard key={movie.id} movie={movie} featured />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Cinematic Trailer Overlay */}
      {isTrailerModalOpen && trailer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black animate-fade-in">
           <button 
             onClick={() => setIsTrailerModalOpen(false)} 
             className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-primary text-white rounded-full transition-all border border-white/20 z-[1100] active:scale-90"
           >
             <X size={24} />
           </button>
           <div className="w-[94%] md:w-[80%] lg:w-[70%] aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(229,9,20,0.4)] border border-white/10 bg-black">
              <YouTube 
                videoId={trailer.key} 
                className="w-full h-full" 
                containerClassName="w-full h-full" 
                opts={{ height: '100%', width: '100%', playerVars: { autoplay: 1, rel: 0, modestbranding: 1 } }} 
              />
           </div>
        </div>
      )}
    </div>
  );
}
