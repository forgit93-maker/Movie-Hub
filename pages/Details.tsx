
import React, { useEffect, useState, useCallback } from 'react';
import * as ReactRouterDom from 'react-router-dom';
import YouTube from 'react-youtube';
import { Helmet } from 'react-helmet-async';
import { tmdbService, getImageUrl } from '../services/tmdb';
import { MovieDetails as MovieDetailsType, Episode, Movie, Image as TMDBImage } from '../types';
import { 
  Star, Clock, PlayCircle, X, LayoutGrid, Heart, Share2, 
  Play, Users, Film, Lightbulb, Info, CheckCircle2
} from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import MovieDetailsLoader from '../components/MovieDetailsLoader';
import MovieCard from '../components/MovieCard';
import { useStore } from '../context/StoreContext';

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
  const [showTip, setShowTip] = useState(true);
  const [shareToast, setShareToast] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [currentEpisodes, setCurrentEpisodes] = useState<Episode[]>([]);

  // Backdrop Carousel State
  const [backdrops, setBackdrops] = useState<TMDBImage[]>([]);
  const [currentBackdropIndex, setCurrentBackdropIndex] = useState(0);

  const { isWatchlisted, addToWatchlist, removeFromWatchlist, user } = useStore();
  const navigate = ReactRouterDom.useNavigate();

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
          
          if (result.images?.backdrops) {
            const filteredBackdrops = result.images.backdrops.slice(0, 8);
            setBackdrops(filteredBackdrops.length > 0 ? filteredBackdrops : [{ file_path: result.backdrop_path } as TMDBImage]);
          } else {
            setBackdrops([{ file_path: result.backdrop_path } as TMDBImage]);
          }
          
          // Check if liked in localStorage
          const localFavs = JSON.parse(localStorage.getItem('moviehub_favorites') || '[]');
          setIsLiked(localFavs.some((fav: any) => String(fav.id) === String(id)));
          
          setSeason(1);
          setEpisode(1);
        } catch (error: any) {
          console.error("Failed to fetch details:", error?.message || "Unknown error");
        }
      }
      setLoading(false);
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [type, id]);

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

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    // SAFE ZONE: No ads on this trigger
    if (!id || !data) return;

    let localFavs = JSON.parse(localStorage.getItem('moviehub_favorites') || '[]');
    const isCurrentlyLiked = localFavs.some((fav: any) => String(fav.id) === String(id));

    if (isCurrentlyLiked) {
      localFavs = localFavs.filter((fav: any) => String(fav.id) !== String(id));
      setIsLiked(false);
      // Also sync with global watchlist if logged in
      if (user && isWatchlisted(id)) removeFromWatchlist(id);
    } else {
      const favItem = {
        id: id,
        title: data.title || data.name,
        poster_path: data.poster_path,
        media_type: type,
        vote_average: data.vote_average,
        release_date: data.release_date || data.first_air_date
      };
      localFavs.push(favItem);
      setIsLiked(true);
      // Also sync with global watchlist if logged in
      if (user && !isWatchlisted(id)) addToWatchlist(id);
    }

    localStorage.setItem('moviehub_favorites', JSON.stringify(localFavs));
    
    // Dispatch custom event for potential listeners (like Favorites page)
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // SAFE ZONE: No ads on this trigger
    const shareTitle = data?.title || data?.name || 'Movie Hub';
    const shareText = `Check out this amazing movie/show on MovieHub! 🎬 ${shareTitle} - Watch it now!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err: any) {
        // Handle potential rejection (user cancelled share)
        console.debug("Share interaction ended:", err?.message || String(err));
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      } catch (err: any) {
        console.error("Clipboard fallback failed:", err?.message || String(err));
      }
    }
  };

  if (loading || (!data && !isYouTubeContent)) return <MovieDetailsLoader />;

  const trailer = data?.videos.results.find(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));
  const year = data ? new Date(data.release_date || data.first_air_date || '').getFullYear() : 'N/A';
  const displayTitle = data ? (data.title || data.name || 'Untitled') : 'Transmission Content';
  const ogImage = getImageUrl(data?.backdrop_path || data?.poster_path || '', 'original');
  
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-12 transition-colors duration-500">
      <Helmet>
        <title>{`${displayTitle} (${year}) - MOVIE HUB`}</title>
        <meta name="description" content={data?.overview} />
        <meta property="og:title" content={`${displayTitle} (${year})`} />
        <meta property="og:description" content={data?.overview} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="video.movie" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={displayTitle} />
        <meta name="twitter:description" content={data?.overview} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>
      
      {/* Hero Section */}
      <div className="relative w-full h-[75vh] md:h-[95vh] lg:h-[105vh] bg-black overflow-hidden shadow-2xl">
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

        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 dark:from-black/40 via-transparent to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 lg:p-24 z-10 pt-[40vh] md:pt-[55vh]">
           <div className="space-y-4 md:space-y-6 animate-fade-in-up">
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
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 md:py-16 space-y-16 md:space-y-24">
        
        {showPlayer && (
            <section className="pt-6 md:pt-10 scroll-mt-24" id="video-player-section">
                
                <div className="max-w-4xl mx-auto mb-6 md:mb-10 space-y-4">
                   {showTip && (
                      <div className="relative p-4 bg-black/60 backdrop-blur-xl border border-primary/40 rounded-2xl flex gap-4 shadow-2xl animate-fade-in-up">
                          <div className="w-10 h-10 bg-yellow-400/10 rounded-full flex items-center justify-center shrink-0 border border-yellow-400/20">
                             <Lightbulb size={20} className="text-yellow-400 fill-yellow-400/20" />
                          </div>
                          <div className="flex-1 pr-8">
                             <p className="text-white font-black text-[12px] md:text-[14px] uppercase tracking-wider mb-0.5">💡 Tip: Enable 'Auto-Rotate' for Full-Screen</p>
                             <p className="text-gray-400 text-[10px] md:text-[12px] font-medium leading-tight">උපදෙස්: වඩාත් හොඳින් පෙනීම සඳහා 'Auto-Rotate' ක්‍රියාත්මක කරන්න.</p>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowTip(false); }}
                            className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all"
                          >
                             <X size={16} />
                          </button>
                      </div>
                   )}

                   <div className="p-4 bg-black/40 backdrop-blur-md border border-amber-500/30 rounded-2xl flex gap-4 shadow-xl">
                      <div className="p-2 bg-amber-500/10 rounded-full shrink-0 h-fit">
                          <Info size={18} className="text-amber-500" />
                      </div>
                      <p className="text-gray-200 text-[10px] md:text-[11px] font-black leading-relaxed uppercase tracking-widest">
                         Any advertisements included in the services are not ours and are owned by the company hosting the services.
                      </p>
                   </div>
                </div>

                <VideoPlayer 
                    tmdbId={data?.id as number || 0} 
                    type={type as 'movie' | 'tv'} 
                    season={season} 
                    episode={episode} 
                    isAnime={isAnime}
                />

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
                                    <div className="relative shrink-0 w-24 md:w-40 h-16 md:h-24 rounded-lg md:rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-md group/poster">
                                        <img src={getImageUrl(ep.still_path, 'w500')} alt={ep.name} className="w-full h-full object-cover transition-transform group-hover/poster:scale-110" />
                                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10 shadow-xl z-10">
                                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-[10px] font-black text-white leading-none tracking-tighter">
                                                {ep.vote_average?.toFixed(1) || '0.0'}
                                            </span>
                                        </div>
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

        <div className="max-w-4xl space-y-4 md:space-y-8 animate-fade-in-up">
           <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 md:w-2.5 md:h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(229,9,20,0.5)]" />
                 <h3 className="text-base md:text-xl font-black uppercase tracking-[0.3em] italic text-gray-900 dark:text-white cursor-pointer">Mission Briefing</h3>
              </div>
              <div className="flex gap-3 md:gap-5">
                 <button 
                  onClick={handleFavorite}
                  className="p-3 md:p-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-gray-600 dark:text-white hover:text-primary transition-all active:scale-90 shadow-sm"
                >
                  <Heart 
                    size={20} 
                    className={`transition-colors duration-300 ${isLiked ? 'text-[#FF0000] fill-[#FF0000]' : ''}`} 
                  />
                </button>
                 <button 
                  onClick={handleShare}
                  className="p-3 md:p-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-gray-600 dark:text-white hover:text-cyan-500 transition-all active:scale-90 shadow-sm relative"
                >
                  <Share2 size={20} />
                  {shareToast && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 animate-fade-in-up whitespace-nowrap shadow-xl">
                      <CheckCircle2 size={12} /> Link Copied!
                    </div>
                  )}
                </button>
              </div>
           </div>
           <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[13px] md:text-[18px] font-medium tracking-tight cursor-pointer" onClick={triggerPopunder}>
             {data?.overview || "Intelligence data redacted."}
           </p>
        </div>

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
