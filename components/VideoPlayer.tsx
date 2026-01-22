
import React, { useState, useEffect, useRef } from 'react';
import { Download, Settings2, Info, Upload, Sliders, Play, Pause, RotateCcw, Trash2, Maximize, Minimize } from 'lucide-react';
import SettingsPanel from './SettingsPanel';
import { SubtitleCue, parseSubtitle } from '../utils/subtitleHelper';
import { SubtitleStyle } from '../types';
import SubtitleOverlay from './SubtitleOverlay';

interface VideoPlayerProps {
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  isAnime?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
    tmdbId, 
    type, 
    season = 1, 
    episode = 1, 
    isAnime = false,
}) => {
  const [currentServer, setCurrentServer] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [subtitleOffset, setSubtitleOffset] = useState(0);
  const [isSubtitlePlaying, setIsSubtitlePlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activePanel, setActivePanel] = useState<'none' | 'subtitles' | 'download'>('none');
  const [subStyle, setSubStyle] = useState<SubtitleStyle>({
    color: '#ffffff',
    fontSize: 20, 
    backgroundColor: 'transparent',
    hasShadow: true,
    opacity: 1
  });

  const servers = [
    { name: "SERVER 01", url: type === 'movie' ? `https://vidsrc.me/embed/movie?tmdb=${tmdbId}` : `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}` },
    { name: "SERVER 02", url: type === 'movie' ? `https://vidsrc.icu/embed/movie/${tmdbId}` : `https://vidsrc.icu/embed/tv/${tmdbId}/${season}/${episode}` },
    { name: "SERVER 03 (ANIME)", url: `https://animesrc.xyz/embed/${type === 'movie' ? 'movie' : 'tv'}/${tmdbId}${type === 'tv' ? `/${season}/${episode}` : ''}` },
    { name: "SERVER 04", url: type === 'movie' ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1` : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}` },
    { name: "SERVER 05", url: type === 'movie' ? `https://www.2embed.cc/embed/${tmdbId}` : `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}` },
    { name: "SERVER 06", url: type === 'movie' ? `https://vidsrc.to/embed/movie/${tmdbId}` : `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}` },
    { name: "SERVER 07", url: type === 'movie' ? `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}` : `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}` }
  ];

  // Monitor orientation for "Fake Fullscreen"
  useEffect(() => {
    const handleResize = () => {
      const isCurrentlyLandscape = window.innerWidth > window.innerHeight && window.innerWidth < 932;
      setIsLandscape(isCurrentlyLandscape);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize(); // Initial check
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const cues = parseSubtitle(content);
        setSubtitleCues(cues);
        setIsSubtitlePlaying(false);
      };
      reader.readAsText(file);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerWrapperRef.current?.requestFullscreen) {
        playerWrapperRef.current.requestFullscreen();
      } else if ((playerWrapperRef.current as any)?.webkitRequestFullscreen) {
        (playerWrapperRef.current as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    let interval: any;
    if (isSubtitlePlaying && subtitleCues.length > 0) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isSubtitlePlaying, subtitleCues]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setCurrentServer(0);
    setSubtitleCues([]);
    setSubtitleOffset(0);
    setIsSubtitlePlaying(false);
    setCurrentTime(0);
  }, [tmdbId, season, episode]);

  return (
    <div className="w-full space-y-5 animate-fade-in-up" id="video-player-section">
      <div 
        ref={playerWrapperRef}
        className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/5 group transition-all ${isLandscape ? 'mobile-landscape-fs' : ''}`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-20">
            <div className="w-10 h-10 border-2 border-white/10 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}
        <iframe 
          key={iframeKey} 
          src={servers[currentServer].url} 
          className="w-full h-full" 
          allowFullScreen 
          onLoad={() => setIsLoading(false)} 
        />
        
        {subtitleCues.length > 0 && (
          <SubtitleOverlay 
            cues={subtitleCues} 
            currentTime={currentTime} 
            offset={subtitleOffset} 
            isLandscape={isLandscape}
            style={{
              ...subStyle,
              fontSize: (isFullscreen || isLandscape) ? subStyle.fontSize * 1.5 : subStyle.fontSize
            }} 
          />
        )}
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar py-2">
        {servers.map((server, index) => (
          <button
            key={index}
            onClick={() => { 
                setCurrentServer(index); 
                setIsLoading(true); 
                setIframeKey(k => k + 1); 
            }}
            className={`shrink-0 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
              currentServer === index 
                ? 'bg-transparent border-[4px] border-primary text-primary shadow-[0_0_20px_rgba(229,9,20,0.3)] scale-105' 
                : 'bg-gray-100 dark:bg-gray-800 border-[4px] border-transparent text-gray-500 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {server.name}
          </button>
        ))}
      </div>

      {subtitleCues.length > 0 && (
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-6 shadow-2xl animate-fade-in-up">
           <div className="flex items-center gap-5">
              <button 
                onClick={() => setIsSubtitlePlaying(!isSubtitlePlaying)}
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-xl active:scale-90 transform hover:scale-110 ${isSubtitlePlaying ? 'bg-green-500 text-white' : 'bg-white/10 text-white'}`}
              >
                {isSubtitlePlaying ? <Pause size={24} fill="currentColor"/> : <Play size={24} fill="currentColor" className="ml-1"/>}
              </button>
              
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">CURRENT</span>
                 <span className="text-lg font-black text-white font-mono tracking-tighter leading-none">{formatTime(currentTime)}</span>
              </div>
           </div>

           <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-2xl border border-white/5 shadow-inner">
              <button 
                onClick={() => setSubtitleOffset(prev => prev - 0.1)}
                className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-white hover:bg-primary transition-all active:scale-90 text-xl font-black"
              >
                -
              </button>
              <div className="flex flex-col items-center min-w-[80px]">
                 <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1">SYNC</span>
                 <span className="text-sm font-black text-white italic tracking-widest">{subtitleOffset >= 0 ? '+' : ''}{subtitleOffset.toFixed(1)}s</span>
              </div>
              <button 
                onClick={() => setSubtitleOffset(prev => prev + 0.1)}
                className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-white hover:bg-primary transition-all active:scale-90 text-xl font-black"
              >
                +
              </button>
           </div>

           <div className="flex items-center gap-3">
              <button 
                onClick={() => { setSubtitleOffset(0); setCurrentTime(0); }}
                className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-primary transition-all"
                title="Reset Subtitles"
              >
                <RotateCcw size={20} />
              </button>
              <button 
                onClick={() => { setSubtitleCues([]); setIsSubtitlePlaying(false); }}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
              >
                <Trash2 size={16} /> Delete
              </button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <Sliders size={18} className="text-primary" />
            <span className="text-[12px] font-black uppercase tracking-[0.25em] text-gray-900 dark:text-white">CUSTOM TOOLS</span>
          </div>
          <div className="flex items-center gap-3">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".srt,.vtt" className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-white/5 rounded-xl text-[11px] font-black text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/10 transition-all active:scale-95 shadow-sm"
            >
              <Upload size={16}/> Upload SRT
            </button>
            <button 
              onClick={() => setActivePanel('subtitles')}
              className="p-3 bg-gray-200 dark:bg-white/5 rounded-xl text-gray-700 dark:text-white hover:bg-primary hover:text-white transition-all shadow-md active:scale-90"
              title="Subtitle Settings"
            >
              <Settings2 size={20} />
            </button>
            <button 
              onClick={handleToggleFullscreen}
              className="p-3 bg-gray-200 dark:bg-white/5 rounded-xl text-gray-700 dark:text-white hover:bg-primary hover:text-white transition-all shadow-md active:scale-90"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>

        <button 
          onClick={() => window.open(`https://dl.vidsrc.vip/${type}/${tmdbId}${type === 'tv' ? `/${season}/${episode}` : ''}`, '_blank')}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-black uppercase tracking-[0.25em] rounded-2xl shadow-xl shadow-cyan-900/20 text-[11px] hover:scale-[1.03] active:scale-[0.97] transition-all transform"
        >
          <Download size={18} /> Download HD Content
        </button>
      </div>

      <SettingsPanel 
        isOpen={activePanel !== 'none'} 
        mode="subtitles" 
        onClose={() => setActivePanel('none')} 
        style={subStyle} 
        onStyleChange={setSubStyle} 
        onDownload={() => {}} 
        isGeneratingLink={false}
      />
    </div>
  );
};

export default VideoPlayer;
