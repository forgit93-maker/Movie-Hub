import React, { useState, useEffect } from 'react';
import { Play, Server, AlertCircle, Cast, Zap } from 'lucide-react';

interface VideoPlayerProps {
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  isAnime?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ tmdbId, type, season = 1, episode = 1, isAnime = false }) => {
  const [currentServer, setCurrentServer] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

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

  // Conditional Logic: If isAnime is true, prepend anime servers to the list
  const servers = isAnime ? [...animeServers, ...standardServers] : standardServers;

  const handleServerChange = (index: number) => {
    setIsLoading(true);
    setCurrentServer(index);
    setIframeKey(prev => prev + 1); // Force re-render of iframe
  };

  // Reset state when content changes
  useEffect(() => {
    setIsLoading(true);
    // If it is anime, default to the first anime server (index 0)
    // If it switches from anime to non-anime, currentServer might be out of bounds or point to wrong one, so reset to 0
    setCurrentServer(0);
  }, [tmdbId, type, season, episode, isAnime]);

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
        {isAnime && (
           <div className="px-3 py-1 bg-purple-600/20 border border-purple-500/50 rounded-full flex items-center">
              <Zap size={14} className="text-purple-400 mr-1.5 fill-current" />
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">Anime Mode</span>
           </div>
        )}
      </div>

      {/* Player Container */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 ring-1 ring-white/10">
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Play size={16} className="text-white fill-white ml-0.5" />
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-3 font-medium animate-pulse tracking-wide">ESTABLISHING CONNECTION...</p>
          </div>
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

      {/* Server Selector Bar */}
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
              {server.isAnime && (
                 <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50"></span>
              )}
              {server.name}
            </button>
          ))}
        </div>
        
        {isAnime && (
           <p className="text-[10px] text-purple-400 italic mt-1 text-center">
             * Purple bordered servers are optimized for Anime.
           </p>
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