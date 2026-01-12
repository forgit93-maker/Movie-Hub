import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- 1. DATA MAPPING (Lanka Cinema Logic) ---
  const mapSinhalaMovie = (item: any): Movie => {
    // RapidAPI 'v2/search' items mapping
    const thumbnails = item.thumbnails || [];
    const poster = thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : null;
    
    return {
      id: `yt_${item.id}`, // Prefix to identify as Lanka Cinema content
      title: item.title,
      name: item.title,
      original_language: 'si', // Flag as Sinhala
      overview: `Lanka Cinema Exclusive: ${item.title}. Published: ${item.publishedTimeText || 'Recently'} • Duration: ${item.lengthText || 'N/A'}.`,
      poster_path: poster,
      backdrop_path: poster,
      release_date: item.publishedTimeText, 
      first_air_date: item.publishedTimeText,
      vote_average: 9.2, // Premium rating for local content
      vote_count: parseInt(item.viewCountText?.replace(/[^0-9]/g, '') || '100'),
      media_type: 'movie',
      genre_ids: []
    };
  };

  const playSuccessSound = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('videoplayback.m4a');
        audioRef.current.volume = 0.2; 
      }
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }, 1000);
        }).catch(() => {});
      }
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  useEffect(() => {
    const doUnifiedSearch = async () => {
      if (query) {
        setLoading(true);
        try {
            // A. Fetch TMDB Results
            const tmdbPromise = tmdbService.searchMulti(query);
            
            // B. Fetch Sinhala/YouTube Results via 'youtube-media-downloader'
            const rapidApiKey = 'bc98d5efd1msh9568cc76df1a18fp1a7e90jsnf632bef6dec7';
            const rapidApiHost = 'youtube-media-downloader.p.rapidapi.com'; 
            
            // If query implies Sinhala, we strictly use the specific endpoint logic
            const isSinhalaSearch = query.toLowerCase().includes('sinhala') || query.toLowerCase().includes('lanka');
            const apiQuery = isSinhalaSearch ? query : `${query} sinhala full movie`;

            const youtubePromise = axios.get(`https://${rapidApiHost}/v2/search`, {
                params: { query: apiQuery }, 
                headers: {
                    'x-rapidapi-key': rapidApiKey,
                    'x-rapidapi-host': rapidApiHost
                }
            }).catch(err => {
                console.error("YouTube API Error:", err);
                return { data: { items: [] } };
            });

            const [tmdbData, youtubeResponse] = await Promise.all([tmdbPromise, youtubePromise]);

            // C. Map YouTube Data
            const youtubeMovies: Movie[] = [];
            if (youtubeResponse.data && youtubeResponse.data.items) {
                youtubeResponse.data.items.forEach((item: any) => {
                    if (item.type === 'video') {
                        youtubeMovies.push(mapSinhalaMovie(item));
                    }
                });
            }

            // D. Merge Results
            // If it's a Sinhala search, prioritize YouTube results
            const unifiedResults = isSinhalaSearch 
                ? [...youtubeMovies, ...tmdbData] 
                : [...tmdbData, ...youtubeMovies];
            
            setResults(unifiedResults);
            
            if (unifiedResults.length > 0) {
                playSuccessSound();
            }

        } catch (error) {
            console.error("Search Failed", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
      } else {
        setResults([]);
      }
    };
    
    doUnifiedSearch();
  }, [query]);

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 px-4 md:px-8 lg:px-12 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
          {loading 
            ? 'Searching Lanka Cinema & Global Libraries...' 
            : query 
                ? `Results for "${query}"` 
                : 'Search Movies & TV'
          }
        </h2>
        
        {!loading && query && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No matches found for "{query}".</p>
          </div>
        )}

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
          {results.map((movie) => (
            <div key={movie.id} className="w-full">
              <MovieCard movie={movie} featured />
            </div>
          ))}
          
          {/* Skeleton Loading State */}
          {loading && Array.from({ length: 12 }).map((_, i) => (
             <div key={i} className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;