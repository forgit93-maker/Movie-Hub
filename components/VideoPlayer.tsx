import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Server, AlertCircle, Cast, Zap, RefreshCw, Plus, Minus, Upload, Download, Settings, X, Maximize, Type, Monitor, Smartphone, Wifi, Film } from 'lucide-react';
import SubtitleOverlay from './SubtitleOverlay';
import { SubtitleCue } from '../utils/subtitleHelper';
import { SubtitleStyle } from '../types';

interface VideoPlayerProps {
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  isAnime?: boolean;
  subtitleCues?: SubtitleCue[]; 
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
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // --- SUBTITLE STATE ---
  const [subTime, setSubTime] = useState(0);
  const [isSubsPlaying, setIsSubsPlaying] = useState(false);
  const [syncOffset, setSyncOffset] = useState(0);
  const timerRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // --- CUSTOMIZATION STATE ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [subStyle, setSubStyle] = useState<SubtitleStyle>({
    color: '#ffffff',
    fontSize: 24,
    backgroundColor: 'transparent',
    hasShadow: true,
    opacity: 1
  });

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

  const downloadQualities = [
      { label: '4K Ultra HD', resolution: '2160p', icon: Monitor, color: 'from-purple-600 to-pink-600', badge: 'ULTRA' },
      { label: 'Full HD', resolution: '1080p', icon: Monitor, color: 'from-blue-600 to-cyan-600', badge: 'HD' },
      { label: 'HD Ready', resolution: '720p', icon: Wifi, color: 'from-green-600 to-emerald-600', badge: 'HD' },
      { label: 'Standard', resolution: '480p', icon: Smartphone, color: 'from-yellow-600 to-orange-600', badge: 'SD' },
      { label: 'Data Saver', resolution: '360p', icon: Smartphone, color: 'from-gray-600 to-gray-500', badge: 'LOW' },
  ];

  const handleServerChange = (index: number) => {
    setIsLoading(true);
    setCurrentServer(index);
    setIframeKey(prev => prev + 1);
  };

  useEffect(() => {
    setIsLoading(true);
    setCurrentServer(0);
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
        setSubTime(0);
        setIsSubsPlaying(false);
    }
  };

  const handleQualityDownload = () => {
    // Construct dynamic download URL for vidsrc.me portal
    // This portal auto-detects availability, so we send the user there for all qualities
    let downloadUrl = "";
    if (type === 'movie') {
        downloadUrl = `https://vidsrc.me/download/movie/${tmdbId}`;
    } else {
        downloadUrl = `https://vidsrc.me/download/tv?tmdb=${tmdbId}&sea=${season}&epi=${episode}`;
    }
    window.open(downloadUrl, '_blank');
    setIsDownloadMenuOpen(false);
  };

  // Custom Fullscreen Handler
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
      <div 
        ref={playerContainerRef}
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 ring-1 ring-white/10 group"
      >
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
            <SubtitleOverlay 
                cues={subtitleCues} 
                currentTime={subTime} 
                offset={syncOffset} 
                style={subStyle}
            />
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

        {/* Custom Controls Layer - Shows on Hover */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-40">
           {/* Only show fullscreen button if we have subtitles, otherwise standard iframe fullscreen is fine */}
           {subtitleCues.length > 0 && (
             <button 
               onClick={toggleFullscreen}
               className="p-2 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-sm"
               title="Fullscreen with Subtitles"
             >
               <Maximize size={20} />
             </button>
           )}
        </div>

        {/* --- SETTINGS MODAL --- */}
        {isSettingsOpen && (
           <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
              <div className="bg-[#1a1a1a] w-full max-w-sm rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
                      <div className="flex items-center gap-2 text-white">
                          <Settings size={18} />
                          <span className="font-bold">Subtitle Settings</span>
                      </div>
                      <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-white">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-5 space-y-6">
                      <div>
                          <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Font Color</label>
                          <div className="flex gap-3">
                              {['#ffffff', '#fbbf24', '#4ade80', '#60a5fa', '#f472b6'].map((color) => (
                                  <button
                                      key={color}
                                      onClick={() => setSubStyle(s => ({ ...s, color }))}
                                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${subStyle.color === color ? 'border-white ring-2 ring-primary' : 'border-transparent'}`}
                                      style={{ backgroundColor: color }}
                                  />
                              ))}
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-2">
                             <span>Font Size</span>
                             <span>{subStyle.fontSize}px</span>
                          </div>
                          <input 
                            type="range" 
                            min="12" 
                            max="40" 
                            step="2"
                            value={subStyle.fontSize}
                            onChange={(e) => setSubStyle(s => ({...s, fontSize: Number(e.target.value)}))}
                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                      </div>
                      <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Background Style</label>
                           <div className="grid grid-cols-3 gap-2">
                               <button onClick={() => setSubStyle(s => ({...s, backgroundColor: 'transparent', hasShadow: true}))} className={`py-1.5 px-2 rounded text-xs font-bold border ${subStyle.backgroundColor === 'transparent' && subStyle.hasShadow ? 'bg-primary border-primary text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>Outline</button>
                               <button onClick={() => setSubStyle(s => ({...s, backgroundColor: 'rgba(0,0,0,0.5)', hasShadow: false}))} className={`py-1.5 px-2 rounded text-xs font-bold border ${subStyle.backgroundColor === 'rgba(0,0,0,0.5)' ? 'bg-primary border-primary text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>Semi-Box</button>
                               <button onClick={() => setSubStyle(s => ({...s, backgroundColor: 'black', hasShadow: false}))} className={`py-1.5 px-2 rounded text-xs font-bold border ${subStyle.backgroundColor === 'black' ? 'bg-primary border-primary text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>Solid Box</button>
                           </div>
                      </div>
                      <div className="pt-4 border-t border-gray-700">
                           <div className="flex justify-between items-center mb-2">
                               <label className="text-xs font-bold text-gray-400 uppercase">Sync Correction</label>
                               <span className={`text-xs font-mono font-bold ${syncOffset === 0 ? 'text-gray-500' : 'text-primary'}`}>
                                   {syncOffset > 0 ? '+' : ''}{syncOffset.toFixed(1)}s
                               </span>
                           </div>
                           <div className="grid grid-cols-4 gap-2">
                               <button onClick={() => adjustSync(-0.5)} className="bg-gray-800 hover:bg-gray-700 text-white rounded p-2 text-xs font-bold">-0.5s</button>
                               <button onClick={() => adjustSync(-0.1)} className="bg-gray-800 hover:bg-gray-700 text-white rounded p-2 text-xs font-bold">-0.1s</button>
                               <button onClick={() => adjustSync(0.1)} className="bg-gray-800 hover:bg-gray-700 text-white rounded p-2 text-xs font-bold">+0.1s</button>
                               <button onClick={() => adjustSync(0.5)} className="bg-gray-800 hover:bg-gray-700 text-white rounded p-2 text-xs font-bold">+0.5s</button>
                           </div>
                      </div>
                  </div>
              </div>
           </div>
        )}

        {/* --- DOWNLOAD QUALITY MODAL --- */}
        {isDownloadMenuOpen && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
                <div className="bg-[#1a1a1a] w-full max-w-sm rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
                        <div className="flex items-center gap-2 text-white">
                            <Download size={18} />
                            <span className="font-bold">Select Quality</span>
                        </div>
                        <button onClick={() => setIsDownloadMenuOpen(false)} className="text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-4 space-y-3">
                        {downloadQualities.map((quality, idx) => (
                            <button
                                key={idx}
                                onClick={handleQualityDownload}
                                className="w-full group relative overflow-hidden rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-700 transition-all duration-300"
                            >
                                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${quality.color}`}></div>
                                <div className="flex items-center justify-between p-3 pl-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full bg-black/40 text-gray-300 group-hover:text-white group-hover:bg-black/60 transition`}>
                                            <quality.icon size={18} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-white font-bold text-sm">{quality.label}</p>
                                            <p className="text-gray-500 text-xs">{quality.resolution}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded bg-gradient-to-r ${quality.color} text-white shadow-lg`}>
                                        {quality.badge}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}
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

      {/* --- PLAYER TOOLS --- */}
      <div className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-white">
                  <Type size={18} />
                  <span className="text-sm font-bold">Tools</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* SETTINGS BUTTON */}
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition"
                  title="Subtitle Settings"
                >
                    <Settings size={18} />
                </button>

                {/* DOWNLOAD MENU BUTTON */}
                <button 
                  onClick={() => setIsDownloadMenuOpen(true)}
                  className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded shadow-lg transition-transform transform hover:scale-105"
                  title="Download in 4K, 1080p, 720p"
                >
                    <Download size={16} />
                    <span className="text-xs hidden md:inline">Download</span>
                </button>

                {/* UPLOAD SUBTITLE BUTTON */}
                <input 
                    type="file" 
                    accept=".srt,.vtt" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleUploadChange}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold text-white transition border border-white/10"
                >
                    <Upload size={12} /> {subtitleFileName ? 'Replace' : 'Add Sub'}
                </button>
                {subtitleFileName && onClearSubtitle && (
                    <button onClick={onClearSubtitle} className="text-red-400 hover:text-red-300 px-2 text-xs">Clear</button>
                )}
              </div>
          </div>
          
          <p className="text-[10px] text-gray-400 text-right -mt-2">
            High-speed download links generated automatically.
          </p>
          
          {subtitleCues.length > 0 && (
              <div className="flex items-center gap-3 bg-gray-900/50 p-2 rounded border border-gray-700 mt-2">
                  <button 
                    onClick={toggleSubTimer}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isSubsPlaying ? 'bg-yellow-600' : 'bg-green-600'
                    } text-white`}
                  >
                      {isSubsPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                  </button>
                  <div className="flex-1">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Synced Time</p>
                      <p className="text-lg font-mono text-white leading-none">{formatTime(subTime)}</p>
                  </div>
                  <button 
                      onClick={() => setSubTime(0)} 
                      className="p-2 text-gray-400 hover:text-white"
                      title="Reset Time"
                  >
                      <RefreshCw size={14} />
                  </button>
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