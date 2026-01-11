import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Server, AlertCircle, Cast, Zap, Captions, RefreshCw, Plus, Minus, Upload } from 'lucide-react';
import SubtitleOverlay from './SubtitleOverlay';
import { SubtitleCue } from '../utils/subtitleHelper';

interface VideoPlayerProps {
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  isAnime?: boolean;
  subtitleCues?: SubtitleCue[]; // Changed from file to parsed cues
  onSubtitleUpload?: (file: File) => void;
  subtitleFileName?: string;
  onClearSubtitle?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
    tmdbId, 
    type, 
    season = 1, 
    episode = 1, 
    isAnime = false, 
    subtitleCues = [],
    onSubtitleUpload,
    subtitleFileName,
    onClearSubtitle
}) => {
  const [currentServer, setCurrentServer] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- SUBTITLE SYNC STATE ---
  const [subTime, setSubTime] = useState(0);
  const [isSubsPlaying, setIsSubsPlaying] = useState(false);
  const [syncOffset, setSyncOffset] = useState(0);
  const timerRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Define Anime Specific Servers
  const animeServers = [
    {
      name: "AnimeSrc (VIP)",
      url: type === 'movie' 
        ? `https://animesrc.xyz/embed/movie/${tmdbId}`
        : `https://animesrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`,
      isAnime: true
    },
    {
      name: "Vidsrc.cc (Anime)",
      url: type === 'movie'
        ? `https://vidsrc.cc/v2/embed/movie/${tmdbId}`
        : `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`,
      isAnime: true
    }
  ];

  // Define Standard Servers
  const standardServers = [
    {
      name: "Server 1: VidSrc.to",
      url: type === 'movie' 
        ? `https://vidsrc.to/embed/movie/${tmdbId}`
        : `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
      isAnime: false
    },
    {
      name: "Server 2: VidSrc.me",
      url: type === 'movie'
        ? `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`
        : `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
      isAnime: false
    },
    {
      name: "Server 3: SuperEmbed",
      url: type === 'movie'
        ? `https://multiembed.eu/?video_id=${tmdbId}&tmdb=1`
        : `https://multiembed.eu/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
      isAnime: false
    },
    {
      name: "Server 4: 2Embed",
      url: type === 'movie'
        ? `https://www.2embed.cc/embed/${tmdbId}`
        : `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
      isAnime: false
    }
  ];

  const servers = isAnime ? [...animeServers, ...standardServers] : standardServers;

  const handleServerChange = (index: number) => {
    setIsLoading(true);
    setCurrentServer(index);
    setIframeKey(prev => prev + 1);
  };

  // Reset EVERYTHING when content changes
  useEffect(() => {
    setIsLoading(true);
    setCurrentServer(0);
    // Reset Subtitle Timer
    setSubTime(0);
    setIsSubsPlaying(false);
    setSyncOffset(0);
  }, [tmdbId, type, season, episode, isAnime]);

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

  const toggleSubTimer = () => setIsSubsPlaying(!isSubsPlaying);
  const adjustSync = (amount: number) => setSyncOffset(prev => prev + amount);
  
  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onSubtitleUpload) {
        onSubtitleUpload(e.target.files[0]);
        // Reset timer when new sub loaded
        setSubTime(0);
        setIsSubsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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

      {/* Player Container with Overlay */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 ring-1 ring-white/10 group">
        
        {/* Loading Overlay */}
        {isLoading && (
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

        {/* Subtitle Overlay Component */}
        {subtitleCues.length > 0 && (
            <SubtitleOverlay cues={subtitleCues} currentTime={subTime} offset={syncOffset} />
        )}

        {/* The Iframe */}
        <iframe
          key={iframeKey}
          src={servers[currentServer].url}
          title="Video Player"
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* --- SERVER SELECTION --- */}
      <div className="bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Server size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Switch Server:</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {servers.map((server, index) => (
            <button
              key={index}
              onClick={() => handleServerChange(index)}
              className={`relative px-3 py-2 rounded text-xs font-bold transition-all duration-200 border text-center truncate ${
                currentServer === index
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${server.isAnime ? 'border-purple-500/50 dark:border-purple-500/50' : ''}`}
            >
              {server.name}
            </button>
          ))}
        </div>
      </div>

      {/* --- SUBTITLE CONTROLS & UPLOAD --- */}
      <div className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                  <Captions size={18} />
                  <span className="text-sm font-bold">Subtitle Tools</span>
              </div>
              {/* UPLOAD BUTTON */}
              <div className="flex items-center gap-2">
                <input 
                    type="file" 
                    accept=".srt,.vtt" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleUploadChange}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold text-white transition"
                >
                    <Upload size={12} /> {subtitleFileName ? 'Replace Sub' : 'Add Subtitle'}
                </button>
                {subtitleFileName && onClearSubtitle && (
                    <button onClick={onClearSubtitle} className="text-red-400 hover:text-red-300 px-2 text-xs">Clear</button>
                )}
              </div>
          </div>

          {subtitleCues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
                  {/* PLAYBACK CONTROL */}
                  <div className="flex items-center gap-3 bg-gray-900/50 p-2 rounded border border-gray-700">
                      <button 
                        onClick={toggleSubTimer}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            isSubsPlaying ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'
                        } text-white`}
                        title={isSubsPlaying ? "Pause Subs" : "Start Subs"}
                      >
                          {isSubsPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                      </button>
                      <div className="flex-1">
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Subtitle Time</p>
                          <p className="text-xl font-mono text-white leading-none">{formatTime(subTime)}</p>
                      </div>
                      <button 
                         onClick={() => setSubTime(0)} 
                         className="p-2 text-gray-400 hover:text-white"
                         title="Reset Time"
                      >
                          <RefreshCw size={14} />
                      </button>
                  </div>

                  {/* SYNC ADJUSTMENT */}
                  <div className="flex items-center gap-3 bg-gray-900/50 p-2 rounded border border-gray-700">
                      <div className="flex-1">
                           <p className="text-[10px] text-gray-400 uppercase font-bold">Sync Delay</p>
                           <p className={`text-sm font-bold ${syncOffset === 0 ? 'text-gray-500' : 'text-blue-400'}`}>
                               {syncOffset > 0 ? '+' : ''}{syncOffset.toFixed(1)}s
                           </p>
                      </div>
                      <div className="flex gap-1">
                          <button 
                            onClick={() => adjustSync(-0.5)}
                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs font-bold flex items-center"
                          >
                              <Minus size={10} className="mr-1" /> 0.5s
                          </button>
                          <button 
                            onClick={() => adjustSync(0.5)}
                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs font-bold flex items-center"
                          >
                              <Plus size={10} className="mr-1" /> 0.5s
                          </button>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded text-center">
                  <p className="text-sm text-blue-200">
                      Upload a .srt file to enable the overlay player.
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                      Since we use external servers, you must manually start/sync subtitles with the video.
                  </p>
              </div>
          )}
      </div>

      {/* Disclaimer */}
      <div className="flex gap-2 text-[10px] text-gray-400 bg-gray-50 dark:bg-black/20 p-2 rounded border border-transparent dark:border-white/5">
          <AlertCircle size={14} className="flex-shrink-0 mt-[1px]" />
          <p>This site does not store any files on its server. All contents are provided by non-affiliated third parties.</p>
      </div>
    </div>
  );
};

export default VideoPlayer;