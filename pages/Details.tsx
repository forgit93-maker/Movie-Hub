import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import YouTube from 'react-youtube';
import { Helmet } from 'react-helmet-async';
import { tmdbService, getImageUrl } from '../services/tmdb';
import { MovieDetails as MovieDetailsType, Episode } from '../types';
import { useStore } from '../context/StoreContext';
import { Star, Clock, PlayCircle, ArrowLeft, Check, X, ExternalLink, Share2, Copy, Facebook, Heart, Play, ChevronDown, Captions, Trash2 } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import VideoPlayer from '../components/VideoPlayer';
import { parseSubtitle, SubtitleCue } from '../utils/subtitleHelper';

const Details: React.FC = () => {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const [data, setData] = useState<MovieDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentBackdropIndex, setCurrentBackdropIndex] = useState(0);
  
  // Player State
  const [showPlayer, setShowPlayer] = useState(false);
  
  // Subtitle State
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);
  const [subtitleFileName, setSubtitleFileName] = useState<string>('');
  
  // TV Series State
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [currentEpisodes, setCurrentEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Modal States
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  
  const { user, addToWatchlist, removeFromWatchlist, isWatchlisted } = useStore();

  // 1. Fetch Main Details
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setShowPlayer(false); 
      setSubtitleCues([]);
      setSubtitleFileName('');
      if (type && id) {
        try {
          const result = await tmdbService.getDetails(type, parseInt(id));
          setData(result);
          
          // Reset defaults
          setSeason(1);
          setEpisode(1);
        } catch (error) {
          console.error(error);
        }
      }
      setLoading(false);
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [type, id]);

  // 2. Dynamic Episode Fetching
  useEffect(() => {
    const fetchSeasonEpisodes = async () => {
        if (type === 'tv' && id) {
            setLoadingEpisodes(true);
            const seasonDetails = await tmdbService.getSeasonDetails(parseInt(id), season);
            if (seasonDetails && seasonDetails.episodes) {
                setCurrentEpisodes(seasonDetails.episodes);
            } else {
                setCurrentEpisodes([]);
            }
            setLoadingEpisodes(false);
        }
    };
    fetchSeasonEpisodes();
  }, [type, id, season]);

  // Reset subtitles when episode changes
  useEffect(() => {
      setSubtitleCues([]);
      setSubtitleFileName('');
  }, [episode, season]);

  // Backdrops Slider
  useEffect(() => {
    if (!data || !data.images?.backdrops?.length) return;
    const maxImages = Math.min(data.images.backdrops.length, 5);
    const interval = setInterval(() => {
      setCurrentBackdropIndex(prev => (prev + 1) % maxImages);
    }, 6000); 
    return () => clearInterval(interval);
  }, [data]);

  const handleWatchNow = () => {
    setShowPlayer(true);
    setTimeout(() => {
        const playerSection = document.getElementById('video-player-section');
        if (playerSection) {
            playerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
  };

  const handleSubtitleUpload = (file: File) => {
    if (file) {
      setSubtitleFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          const parsed = parseSubtitle(text);
          setSubtitleCues(parsed);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearSubtitle = () => {
    setSubtitleCues([]);
    setSubtitleFileName('');
  };

  if (loading) return <div className="h-screen flex items-center justify-center dark:text-white text-gray-900">Loading details...</div>;
  if (!data) return <div className="h-screen flex items-center justify-center dark:text-white text-gray-900">Content not found.</div>;

  const trailer = data.videos.results.find(v => v.site === "YouTube" && v.type === "Trailer") 
               || data.videos.results.find(v => v.site === "YouTube");
               
  const director = data.credits.crew.find(c => c.job === "Director")?.name;
  const year = new Date(data.release_date || data.first_air_date || '').getFullYear();
  const inWatchlist = isWatchlisted(data.id);
  const displayTitle = data.title || data.name || 'Untitled';
  
  // Logic to identify Anime
  const isAnime = data.genres.some(g => 
    g.name.toLowerCase() === 'animation' || 
    g.name.toLowerCase() === 'anime'
  );
  
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

  const handleShare = async () => {
    const shareData = {
      title: displayTitle,
      text: `Check out ${displayTitle} on Movie Hub! \n${data.overview.substring(0, 100)}...`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      setIsShareOpen(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess('Link copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const opts: any = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      origin: window.location.origin,
      enablejsapi: 1,
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-20 md:pb-0 relative transition-colors duration-300">
      
      <Helmet>
        <title>{`${displayTitle} (${year}) - MOVIE HUB`}</title>
        <meta name="description" content={data.overview} />
        <meta property="og:title" content={`${displayTitle} - MOVIE HUB`} />
        <meta property="og:description" content={data.overview} />
        <meta property="og:image" content={getImageUrl(data.backdrop_path, 'original')} />
      </Helmet>

      {/* Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden group bg-black">
        <Link 
          to={type === 'tv' ? '/tv' : '/movies'}
          className="absolute top-20 left-4 z-30 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-lg shadow-black/50 hover:bg-black/80 transition-all duration-300 group-hover:scale-105"
        >
          <ArrowLeft size={16} className="text-white" />
        </Link>

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
             <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent"></div>
             <div className="absolute inset-0 bg-black/20"></div>
           </div>
        ))}
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
           <h1 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-2xl mb-3 md:mb-4 text-white">
             {displayTitle} <span className="text-gray-300 font-light text-xl md:text-3xl">({year})</span>
           </h1>
           <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-200 mb-6">
              <span className="flex items-center text-yellow-400 font-bold bg-black/40 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                <Star size={14} className="mr-1 fill-current"/> {data.vote_average.toFixed(1)}
              </span>
              {data.runtime && (
                <span className="flex items-center bg-black/20 px-2 py-1 rounded backdrop-blur-sm text-white">
                  <Clock size={14} className="mr-1"/> {Math.floor(data.runtime / 60)}h {data.runtime % 60}m
                </span>
              )}
              <div className="flex flex-wrap gap-2">
                {data.genres.slice(0, 3).map(g => (
                  <span key={g.id} className="bg-black/40 text-white px-2 py-0.5 rounded text-[10px] md:text-xs backdrop-blur-sm border border-white/5">{g.name}</span>
                ))}
              </div>
           </div>

           {/* Hero Actions Container */}
           <div className="flex flex-col gap-5 items-start animate-fade-in-up">
               {/* Primary Actions: Watch & Trailer */}
               <div className="flex flex-wrap items-center gap-4">
                   <button 
                     onClick={handleWatchNow}
                     className="flex items-center px-6 py-3 bg-primary hover:bg-red-700 text-white font-bold rounded-lg transition-transform transform hover:scale-105 shadow-lg shadow-primary/30 group"
                   >
                     <Play size={20} className="mr-2 fill-current group-hover:scale-110 transition-transform" /> Watch Now
                   </button>
                   {trailer && (
                     <button 
                       onClick={() => { setVideoError(false); setIsTrailerOpen(true); }}
                       className="flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-lg transition-transform transform hover:scale-105 border border-white/20"
                     >
                       <PlayCircle size={20} className="mr-2" /> Trailer
                     </button>
                   )}
               </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        <div className="max-w-4xl">
           {/* Overview Header with Icons */}
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Overview</h3>
             
             <div className="flex items-center gap-4">
                <button 
                  onClick={toggleWatchlist}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                >
                   <Heart 
                     size={24} 
                     className={`transition-colors duration-300 ${inWatchlist ? 'fill-primary text-primary' : 'text-gray-500 hover:text-primary'}`} 
                   />
                </button>
                <button 
                   onClick={handleShare}
                   className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-primary transition-all duration-300"
                   title="Share this movie"
                >
                   <Share2 size={24} />
                </button>
             </div>
           </div>

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

        {/* Top Cast Section */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-primary pl-3">Top Cast</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar">
            {data.credits.cast.slice(0, 15).map(actor => (
              <div key={actor.id} className="flex-shrink-0 w-24 md:w-28 text-center group">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-800 group-hover:border-primary transition-colors duration-300 mb-2 mx-auto shadow-lg relative">
                   {actor.profile_path ? (
                     <img src={getImageUrl(actor.profile_path)} alt={actor.name} className="w-full h-full object-cover" loading="lazy" />
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

        {/* --- VIDEO PLAYER & EPISODE SECTION (CONDITIONALLY RENDERED) --- */}
        {showPlayer && (
            <section className="pt-6 border-t border-gray-200 dark:border-gray-800 scroll-mt-24 animate-fade-in-up" id="video-player-section">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Player (Span 2) */}
                <div className="lg:col-span-2 space-y-4">
                    <VideoPlayer 
                        tmdbId={parseInt(id!)} 
                        type={type as 'movie' | 'tv'} 
                        season={season}
                        episode={episode}
                        isAnime={isAnime}
                        subtitleCues={subtitleCues}
                        subtitleFileName={subtitleFileName}
                        onSubtitleUpload={handleSubtitleUpload}
                        onClearSubtitle={handleClearSubtitle}
                    />
                </div>

                {/* Right Column: Episode List (TV Only) */}
                {type === 'tv' && (
                    <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-[500px] lg:h-auto max-h-[600px]">
                        {/* Season Selector Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black/20 z-10">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Select Season</h3>
                        <div className="relative">
                            <select 
                                value={season}
                                onChange={(e) => {
                                setSeason(Number(e.target.value));
                                setEpisode(1);
                                }}
                                className="w-full appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 font-bold focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                            >
                                {data.seasons?.filter(s => s.season_number > 0).map(s => (
                                <option key={s.id} value={s.season_number}>Season {s.season_number}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                        </div>
                        </div>

                        {/* Episode List */}
                        <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                        {loadingEpisodes ? (
                            <div className="flex flex-col items-center justify-center h-40 space-y-2">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-xs text-gray-500">Loading episodes...</p>
                            </div>
                        ) : (
                            currentEpisodes.map((ep) => (
                                <button
                                key={ep.id}
                                onClick={() => setEpisode(ep.episode_number)}
                                className={`w-full flex items-start gap-3 p-2 rounded-lg transition-all duration-200 text-left group ${
                                    episode === ep.episode_number 
                                    ? 'bg-primary/10 border border-primary/30' 
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-800 border border-transparent'
                                }`}
                                >
                                    {/* Thumbnail */}
                                    <div className="relative w-28 aspect-video bg-gray-300 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                    {ep.still_path ? (
                                        <img src={getImageUrl(ep.still_path)} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                            <PlayCircle size={24} />
                                        </div>
                                    )}
                                    {/* Rating Badge */}
                                    <div className="absolute top-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                        <Star size={8} className="text-yellow-400 fill-yellow-400" /> {ep.vote_average.toFixed(1)}
                                    </div>
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 min-w-0 py-1">
                                    <p className={`text-xs font-bold mb-0.5 truncate ${episode === ep.episode_number ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                                        {ep.episode_number}. {ep.name}
                                    </p>
                                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                                        {ep.overview || "No description available."}
                                    </p>
                                    </div>
                                </button>
                            ))
                        )}
                        </div>
                    </div>
                )}
            </div>
            </section>
        )}

        {/* Similar Movies */}
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

      {/* Trailer Modal */}
      {isTrailerOpen && trailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in-up">
           <div className="absolute inset-0" onClick={() => setIsTrailerOpen(false)}></div>
           <div className="relative w-full max-w-5xl">
             <button 
               onClick={() => setIsTrailerOpen(false)}
               className="absolute top-[-45px] right-0 z-50 flex items-center text-white hover:text-primary transition-colors pb-2"
             >
               <span className="mr-2 text-sm font-bold uppercase tracking-widest hidden sm:inline text-white">Close</span>
               <div className="bg-black/50 p-2 rounded-full border border-white/20 hover:bg-white/20">
                 <X size={24} className="text-white" />
               </div>
             </button>

             <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col justify-center items-center relative z-40">
               {!videoError ? (
                 <YouTube
                   videoId={trailer.key}
                   opts={opts}
                   className="w-full h-full"
                   iframeClassName="w-full h-full"
                   onError={() => setVideoError(true)}
                 />
               ) : (
                 <div className="flex flex-col items-center text-center p-8 space-y-4">
                    <div className="p-4 bg-gray-800 rounded-full text-gray-400 mb-2">
                      <PlayCircle size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Trailer Unavailable Here</h3>
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
        </div>
      )}

      {/* Share Modal */}
      {isShareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="absolute inset-0" onClick={() => setIsShareOpen(false)}></div>
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-xl p-6 shadow-2xl relative z-10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Share this {type === 'movie' ? 'Movie' : 'TV Show'}</h3>
            <div className="grid grid-cols-1 gap-3">
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(`Check out ${displayTitle} on Movie Hub! ${window.location.href}`)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-[#25D366] text-white rounded-lg font-bold hover:opacity-90 transition"
              >
                WhatsApp
              </a>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-[#1877F2] text-white rounded-lg font-bold hover:opacity-90 transition"
              >
                <Facebook size={20} /> Facebook
              </a>
              <button 
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 p-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                {copySuccess ? <Check size={20} /> : <Copy size={20} />}
                {copySuccess || 'Copy Link'}
              </button>
            </div>
            <button 
              onClick={() => setIsShareOpen(false)} 
              className="mt-6 w-full py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Details;