
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Server, AlertCircle, Cast, Zap, RefreshCw, Upload, Download, Settings, Maximize, Type, Minus, Plus, Globe, RotateCw, X, SkipForward, Search, ChevronRight } from 'lucide-react';
import axios from 'axios';
import SubtitleOverlay from './SubtitleOverlay';
import SettingsPanel from './SettingsPanel';
import { SubtitleCue } from '../utils/subtitleHelper';
import { SubtitleStyle } from '../types';

interface VideoPlayerProps {
  tmdbId: number;
  type: 'movie' | 'tv';
  title?: string;
  year?: string;
  season?: number;
  episode?: number;
  isAnime?: boolean;
  originalLanguage?: string;
  subtitleCues?: SubtitleCue[]; 
  onSubtitleUpload?: (file: File) => void;
  subtitleFileName?: string;
  onClearSubtitle?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
    tmdbId, 
    type, 
    title = '',
    year = '',
    season = 1, 
    episode = 1, 
    isAnime = false, 
    originalLanguage = 'en',
    subtitleCues = [],
    onSubtitleUpload,
    subtitleFileName,
    onClearSubtitle
}) => {
  const [currentServer, setCurrentServer] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- DAILYMOTION STATE ---
  const [dailymotionId, setDailymotionId] = useState<string | null>(null);
  const [isDmLoading, setIsDmLoading] = useState(false);
  const [dmError, setDmError] = useState(false);

  // --- SEQUENCE STATES ---
  const [showTip, setShowTip] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  
  // PARENT CONTAINER REF for Custom Fullscreen (Wrapper-based)
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // --- SUBTITLE STATE ---
  const [subTime, setSubTime] = useState(0);
  const [isSubsPlaying, setIsSubsPlaying] = useState(false);
  const [syncOffset, setSyncOffset] = useState(0);
  const timerRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // --- PANEL STATES (Mutually Exclusive) ---
  const [activePanel, setActivePanel] = useState<'none' | 'subtitles' | 'download'>('none');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const [subStyle, setSubStyle] = useState<SubtitleStyle>({
    color: '#ffffff',
    fontSize: 20, 
    backgroundColor: 'transparent',
    hasShadow: true,
    opacity: 1
  });

  // --- NATIVE BANNER AD INTEGRATION (Between Player & List) ---
  useEffect(() => {
    const container = document.getElementById('container-a28bf13ac5a5cb052747b3d77bd83fe4');
    if (container) {
        // Clear just in case
        container.innerHTML = '';
        
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = "//awkwardmonopoly.com/a28bf13ac5a5cb052747b3d77bd83fe4/invoke.js";
        container.appendChild(script);
    }
  }, []);

  // --- HELPER: TRIGGER ADSTERRA POPUNDER ON CLICK ---
  const triggerAdsterra = () => {
    // Re-inject the script to attempt re-triggering the popunder mechanism
    const scriptUrl = "//awkwardmonopoly.com/54/42/28/544228badfcc4c2bfc0469db956fed8d.js";
    
    // Remove existing if any (cleanup old listeners)
    const oldScript = document.querySelector(`script[src="${scriptUrl}"]`);
    if (oldScript) {
      oldScript.remove();
    }

    // Inject new script
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);
  };

  // 1. Defined Server List (9 Specific Servers)
  const servers = [
    {
      name: "VidSrc.to",
      url: type === 'movie' 
        ? `https://vidsrc.to/embed/movie/${tmdbId}`
        : `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
      isDirect: false
    },
    {
      name: "VidSrc.me",
      url: type === 'movie'
        ? `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`
        : `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
      isDirect: false
    },
    {
      name: "SuperEmbed",
      url: type === 'movie'
        ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`
        : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
      isDirect: false
    },
    {
      name: "2Embed",
      url: type === 'movie'
        ? `https://www.2embed.cc/embed/${tmdbId}`
        : `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
      isDirect: false
    },
    {
      name: "Dailymotion", 
      url: dailymotionId ? `https://www.dailymotion.com/embed/video/${dailymotionId}?autoplay=1` : '',
      isDailymotion: true,
      isDirect: false
    },
    {
      name: "Tamil Blasters",
      url: type === 'movie'
        ? `https://vidsrc.me/embed/movie?tmdb=${tmdbId}` // Fallback
        : `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
      isDirect: false
    },
    {
      name: "TamilMV",
      url: type === 'movie'
        ? `https://autoembed.to/movie/tmdb/${tmdbId}`
        : `https://autoembed.to/tv/tmdb/${tmdbId}-${season}-${episode}`,
      isDirect: false
    },
    {
      name: "SmashyStream",
      url: type === 'movie'
        ? `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`
        : `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
      isDirect: false
    },
    {
      name: "WarezCDN",
      url: type === 'movie'
        ? `https://embed.warezcdn.com/v2/movie/${tmdbId}`
        : `https://embed.warezcdn.com/v2/series/${tmdbId}/${season}/${episode}`,
      isDirect: false
    }
  ];

  const currentServerObj = servers[currentServer];

  // --- SMART DAILYMOTION SEARCH LOGIC ---
  const searchDailymotionVideo = async () => {
      setDailymotionId(null);
      setDmError(false);
      setIsDmLoading(true);

      try {
          const cleanTitle = title.trim();
          const cleanYear = year.toString().trim();
          
          // Construct Query: "{title} {year}"
          let query = '';
          if (type === 'movie') {
              query = `${cleanTitle} ${cleanYear}`;
          } else {
              query = `${cleanTitle} Season ${season} Episode ${episode}`;
          }

          // Fetch results from Dailymotion API
          const response = await axios.get(`https://api.dailymotion.com/videos`, {
              params: {
                  fields: 'id,title,views_total',
                  search: query,
                  sort: 'visited',
                  limit: 5
              }
          });

          const results = response.data.list || [];
          let bestMatchId = null;

          // Strict Matching Logic: Title matches AND Year is present in the video title
          for (const video of results) {
              const videoTitle = video.title.toLowerCase();
              const searchTitle = cleanTitle.toLowerCase();
              
              // 1. Year Check (Mandatory for Movies)
              if (type === 'movie' && !videoTitle.includes(cleanYear)) {
                  continue;
              }

              // 2. Title Check (Must contain movie title)
              if (videoTitle.includes(searchTitle)) {
                  bestMatchId = video.id;
                  break; // Found high-relevance match
              }
          }

          if (bestMatchId) {
              setDailymotionId(bestMatchId);
          } else {
              setDmError(true);
          }

      } catch (error) {
          console.error("Dailymotion API Error:", error);
          setDmError(true);
      } finally {
          setIsDmLoading(false);
      }
  };

  const handleServerChange = (index: number) => {
    // 1. Trigger Ad on ANY server switch
    triggerAdsterra();
    
    // 2. Standard State Update
    setIsLoading(true);
    setCurrentServer(index);
    setIframeKey(prev => prev + 1);
  };

  // Watch for server change to Dailymotion
  useEffect(() => {
     // @ts-ignore
     if (servers[currentServer].isDailymotion && !dailymotionId) {
         searchDailymotionVideo();
     }
  }, [currentServer, servers, dailymotionId]);


  useEffect(() => {
    setIsLoading(true);
    setCurrentServer(0);
    setSubTime(0);
    setIsSubsPlaying(false);
    setSyncOffset(0);
    
    // Reset Sequence on new ID
    setShowIntro(true);
    setShowTip(true);

    // Reset DM State
    setDailymotionId(null);
    setDmError(false);
  }, [tmdbId, type, season, episode]);


  // Subtitle Timer Logic
  useEffect(() => {
    if (isSubsPlaying) {
      lastTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const delta = (now - lastTimeRef.current) / 1000;
        setSubTime(prev => prev + delta);
        lastTimeRef.current = now;
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSubsPlaying]);

  // Orientation Listener for Mobile Landscape Auto-Fullscreen
  useEffect(() => {
    const handleOrientation = () => {
        const isLandscape = window.screen.orientation?.type.includes('landscape') 
                            || window.orientation === 90 
                            || window.orientation === -90;
        
        if (isLandscape && window.innerWidth < 1024 && playerContainerRef.current && !showIntro) {
            if (!document.fullscreenElement) {
               playerContainerRef.current.requestFullscreen().catch(() => {});
            }
        }
    };

    if (window.screen.orientation) {
        window.screen.orientation.addEventListener('change', handleOrientation);
    }
    window.addEventListener('orientationchange', handleOrientation);

    return () => {
        if (window.screen.orientation) {
            window.screen.orientation.removeEventListener('change', handleOrientation);
        }
        window.removeEventListener('orientationchange', handleOrientation);
    };
  }, [showIntro]);

  const toggleSubTimer = () => setIsSubsPlaying(!isSubsPlaying);
  const adjustSync = (amount: number) => setSyncOffset(prev => prev + amount);
  
  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onSubtitleUpload) {
        onSubtitleUpload(e.target.files[0]);
        setSubTime(0);
        setIsSubsPlaying(false);
    }
  };

  // --- DOWNLOAD LOGIC ---
  const generateDownloadLink = async (quality: string) => {
    setIsGeneratingLink(true);
    
    let sourceUrl = "";
    if (type === 'movie') {
        sourceUrl = `https://vidsrc.pm/download/movie/${tmdbId}`;
    } else {
        sourceUrl = `https://vidsrc.pm/download/tv?tmdb=${tmdbId}&sea=${season}&epi=${episode}`;
    }

    const rapidApiKey = 'bc98d5efd1msh9568cc76df1a18fp1a7e90jsnf632bef6dec7';
    const rapidApiHost = 'download-all-in-one-ultimate.p.rapidapi.com';

    try {
        const minTime = new Promise(resolve => setTimeout(resolve, 1500));
        const apiCall = axios.get('https://download-all-in-one-ultimate.p.rapidapi.com/autolink', {
            params: { url: sourceUrl },
            headers: {
                'x-rapidapi-key': rapidApiKey,
                'x-rapidapi-host': rapidApiHost
            }
        });

        const [response] = await Promise.all([apiCall, minTime]);

        if (response.data && (response.data.downloadLink || response.data.url)) {
             const finalLink = response.data.downloadLink || response.data.url;
             window.open(finalLink, '_blank');
        } else {
             window.open(sourceUrl, '_blank');
        }
    } catch (error) {
        console.error("Download API Error, falling back to source:", error);
        window.open(sourceUrl, '_blank');
    } finally {
        setIsGeneratingLink(false);
        setActivePanel('none');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerContainerRef.current) {
        playerContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Helper to determine what to render inside the player area
  const renderPlayerContent = () => {
      // @ts-ignore
      if (currentServerObj.isDailymotion) {
          if (isDmLoading) {
             return (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20">
                    <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400 text-xs mt-3 font-medium animate-pulse tracking-widest">SEARCHING DAILYMOTION...</p>
                 </div>
             );
          }
          if (dmError || !dailymotionId) {
             return (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20 space-y-4">
                    <div className="p-4 bg-gray-800 rounded-full text-gray-400">
                        <Search size={32} />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-bold mb-1">No exact match found</p>
                        <p className="text-xs text-gray-500">Try Server 1 or 2 instead.</p>
                    </div>
                 </div>
             );
          }
      }

      return (
        <iframe
            key={iframeKey}
            src={currentServerObj.url}
            title="Video Player"
            className="w-full h-full absolute inset-0 z-0 object-contain"
            allowFullScreen={false} 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onLoad={() => setIsLoading(false)}
        />
      );
  };

  return (
    <div className="w-full space-y-4 animate-fade-in-up" id="video-player-section">
      {/* Header */}
      <div className="flex items-center justify-between px-1 border-b border-gray-200 dark:border-gray-800 pb-3">
        <div className="flex items-center space-x-2">
          <Cast className="text-primary" size={24} />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none">
              {type === 'movie' ? 'Now Playing' : `S${season}:E${episode} Now Playing`}
            </h2>
            <p className="text-xs text-gray-500 mt-1">Select a server below if the video doesn't load.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {isAnime && (
            <div className="px-3 py-1 bg-purple-600/20 border border-purple-500/50 rounded-full flex items-center">
                <Zap size={14} className="text-purple-400 mr-1.5 fill-current" />
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">Anime Mode</span>
            </div>
            )}
        </div>
      </div>

      {/* STEP 1: TEXT TIP */}
      {showTip && (
         <div className="relative p-4 bg-gradient-to-r from-gray-900 to-black border border-primary/30 rounded-xl flex items-start gap-3 shadow-lg animate-fade-in-up">
            <div className="p-2 bg-primary/20 rounded-full text-primary shrink-0">
                <RotateCw size={20} />
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold text-white mb-1">
                    💡 Tip: Enable 'Auto-Rotate' for Full-Screen
                </p>
                <p className="text-xs text-gray-400 font-medium">
                    උපදෙස: වඩාත් හොඳින් පෙනීම සඳහා 'Auto-Rotate' ක්‍රියාත්මක කරන්න.
                </p>
            </div>
            <button
                onClick={() => setShowTip(false)}
                className="text-gray-500 hover:text-white transition-colors p-1"
            >
                <X size={18} />
            </button>
         </div>
      )}

      {/* FULLSCREEN WRAPPER CONTAINER (Step 2 & 3) */}
      <div 
        ref={playerContainerRef}
        id="player-wrapper"
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 ring-1 ring-white/10 group flex flex-col justify-center"
      >
        {/* STEP 2: INTRO VIDEO (Auto-play enabled) */}
        {showIntro ? (
           <div className="absolute inset-0 z-30 bg-black flex flex-col items-center justify-center">
               <video 
                  src="https://www.mediafire.com/file/3mraz2r6th3qnqk/YTDown.com_Shorts_Turn-your-phone-to-landscape-mode-rotate_Media_M-W4zcg3KFw_001_1080p.mp4/file"
                  className="w-full h-full object-contain"
                  autoPlay
                  muted 
                  playsInline
                  onEnded={() => setShowIntro(false)}
                  onError={() => {
                      // Silently fail over to main content if video fails to load
                      setShowIntro(false);
                  }}
               />
               <button 
                  onClick={() => setShowIntro(false)}
                  className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-full border border-white/20 backdrop-blur-md transition-all z-40"
               >
                  Skip Intro <SkipForward size={14} />
               </button>
           </div>
        ) : (
           /* STEP 3: MAIN PLAYER CONTENT */
           <>
                {/* Loading Overlay (Standard) */}
                {/* @ts-ignore */}
                {isLoading && !currentServerObj.isDailymotion && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10 pointer-events-none">
                    <div className="relative">
                    <div className="w-12 h-12 border-4 border-gray-700 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Play size={16} className="text-white fill-white ml-0.5" />
                    </div>
                    </div>
                    <p className="text-gray-400 text-xs mt-3 font-medium animate-pulse tracking-wide">ESTABLISHING CONNECTION...</p>
                </div>
                )}

                {/* Subtitle Overlay */}
                {subtitleCues.length > 0 && (
                    <div className="absolute inset-0 pointer-events-none z-[9999]">
                        <SubtitleOverlay 
                            cues={subtitleCues} 
                            currentTime={subTime} 
                            offset={syncOffset} 
                            style={subStyle}
                        />
                    </div>
                )}

                {/* Render Content Logic */}
                {renderPlayerContent()}

                {/* Custom Fullscreen Button */}
                <div className="absolute top-4 right-4 z-[10000] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                    onClick={toggleFullscreen}
                    className="p-2.5 bg-black/60 hover:bg-black/90 rounded-full text-white backdrop-blur-md border border-white/10 shadow-lg transform active:scale-95 transition-all"
                    title="Fullscreen (with Subtitles)"
                    >
                    <Maximize size={22} />
                    </button>
                </div>
           </>
        )}
      </div>

      {/* --- NATIVE BANNER AD --- */}
      <div className="w-full my-4 flex flex-col items-center justify-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Advertisement</span>
          <div id="container-a28bf13ac5a5cb052747b3d77bd83fe4" className="w-full flex justify-center"></div>
      </div>

      {/* --- VERTICAL SERVER SELECTION (STREAMING NOW STYLE) --- */}
      <div className="bg-gray-100 dark:bg-[#111] p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-700/50">
          <Server size={18} className="text-primary" />
          <span className="text-sm font-bold uppercase tracking-wider">Select Source:</span>
        </div>
        
        {/* Vertical List Layout */}
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {servers.map((server: any, index: number) => (
            <button
              key={index}
              onClick={() => handleServerChange(index)}
              className={`relative w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group border ${
                currentServer === index
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                  : 'bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
               <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentServer === index ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-black/30 text-gray-500'
                  }`}>
                      {index + 1}
                  </div>
                  <div className="text-left">
                      <span className="block text-sm font-bold">{server.name}</span>
                      <span className={`text-[10px] ${currentServer === index ? 'text-blue-100' : 'text-green-500'}`}>
                          {index < 2 ? 'Fast • Verified' : 'High Speed'}
                      </span>
                  </div>
               </div>

               <div className="flex items-center gap-2">
                   <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                       currentServer === index ? 'bg-black/20 border-white/20 text-white' : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500'
                   }`}>
                       1080p
                   </span>
                   {currentServer === index && <ChevronRight size={16} className="animate-pulse" />}
               </div>
            </button>
          ))}
        </div>
      </div>

      {/* --- PLAYER TOOLS --- */}
      <div className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-white">
                  <Type size={18} />
                  <span className="text-sm font-bold">Tools & Subtitles</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                
                {/* SUBTITLE SETTINGS TOGGLE */}
                <button 
                  onClick={() => setActivePanel(activePanel === 'subtitles' ? 'none' : 'subtitles')}
                  className={`p-2 rounded-lg border transition flex items-center gap-2 ${activePanel === 'subtitles' ? 'bg-primary border-primary text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'}`}
                  title="Subtitle Settings"
                >
                    <Settings size={18} />
                </button>

                {/* UPLOAD BUTTON */}
                <input 
                    type="file" 
                    accept=".srt,.vtt" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleUploadChange}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-bold text-white transition border border-gray-700"
                >
                    <Upload size={16} /> {subtitleFileName ? 'Replace' : 'Upload Sub'}
                </button>

                {/* DOWNLOAD TOGGLE */}
                <button 
                  onClick={() => setActivePanel(activePanel === 'download' ? 'none' : 'download')}
                  className={`flex items-center gap-2 px-4 py-2 border font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 ${activePanel === 'download' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gradient-to-r from-cyan-600 to-blue-700 border-transparent text-white'}`}
                  title="Download Options"
                >
                    <Download size={16} />
                    <span className="text-xs">Download</span>
                </button>
              </div>
          </div>
          
          {subtitleCues.length > 0 ? (
              <div className="flex flex-wrap items-center gap-3 bg-gray-900/50 p-2 rounded border border-gray-700 mt-2">
                  
                  {/* PLAY & SYNC CONTROLS */}
                  <div className="flex items-center gap-3">
                      {/* Play/Pause */}
                      <button 
                        onClick={toggleSubTimer}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                            isSubsPlaying ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'
                        } text-white shrink-0`}
                      >
                          {isSubsPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                      </button>

                      {/* Sync Buttons & Value */}
                      <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 h-10">
                          <button 
                            onClick={() => adjustSync(-0.1)} 
                            className="h-full px-3 hover:bg-gray-700 text-white rounded-l-lg transition-colors border-r border-gray-700 flex items-center justify-center"
                            title="Delay (-0.1s)"
                          >
                             <Minus size={14} />
                          </button>
                          
                          <div className="px-3 flex flex-col items-center justify-center min-w-[60px]">
                             <span className="text-[9px] text-gray-400 uppercase font-bold leading-none mb-0.5">Sync</span>
                             <span className={`text-xs font-mono font-bold leading-none ${syncOffset === 0 ? 'text-gray-500' : 'text-primary'}`}>
                                {syncOffset > 0 ? '+' : ''}{syncOffset.toFixed(1)}s
                             </span>
                          </div>

                          <button 
                             onClick={() => adjustSync(0.1)} 
                             className="h-full px-3 hover:bg-gray-700 text-white rounded-r-lg transition-colors border-l border-gray-700 flex items-center justify-center"
                             title="Speed up (+0.1s)"
                          >
                             <Plus size={14} />
                          </button>
                      </div>
                  </div>

                  {/* Time Info */}
                  <div className="flex-1 px-3 border-l border-gray-700 min-w-[80px]">
                      <p className="text-[10px] text-gray-400 uppercase font-bold leading-none mb-0.5">Time</p>
                      <p className="text-xl font-mono text-white leading-none tracking-wider">{formatTime(subTime)}</p>
                  </div>

                  {/* Reset Button */}
                  <div className="flex items-center gap-2 ml-auto">
                    <button 
                        onClick={() => setSubTime(0)} 
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Reset Timer to 00:00"
                    >
                        <RefreshCw size={16} />
                    </button>
                    
                    {onClearSubtitle && (
                        <button onClick={onClearSubtitle} className="text-red-400 hover:text-red-300 px-2 text-xs font-bold border-l border-gray-700 pl-3">
                            Clear
                        </button>
                    )}
                  </div>
              </div>
          ) : (
            <div className="bg-gray-900/30 p-3 rounded border border-gray-800 text-center">
               <p className="text-gray-500 text-xs">Upload a subtitle file (.srt) to enable sync controls and overlay.</p>
            </div>
          )}
      </div>

      {/* --- DUAL SETTINGS PANEL (EXTERNAL BLOCK) --- */}
      <SettingsPanel 
        isOpen={activePanel !== 'none'}
        mode={activePanel === 'download' ? 'download' : 'subtitles'}
        onClose={() => setActivePanel('none')} 
        style={subStyle}
        onStyleChange={setSubStyle}
        onDownload={generateDownloadLink}
        isGeneratingLink={isGeneratingLink}
      />

      {/* Disclaimer */}
      <div className="flex gap-2 text-[10px] text-gray-400 bg-gray-50 dark:bg-black/20 p-2 rounded border border-transparent dark:border-white/5">
          <AlertCircle size={14} className="flex-shrink-0 mt-[1px]" />
          <p>This site does not store any files on its server. All contents are provided by non-affiliated third parties.</p>
      </div>
    </div>
  );
};

export default VideoPlayer;
