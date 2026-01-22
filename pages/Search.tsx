
import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const doUnifiedSearch = async () => {
      if (query) {
        setLoading(true);
        try {
            const tmdbPromise = tmdbService.searchMulti(query);
            
            const rapidApiKey = 'bc98d5efd1msh9568cc76df1a18fp1a7e90jsnf632bef6dec7';
            const youtubeHost = 'youtube-search-and-download.p.rapidapi.com'; 
            
            const youtubePromise = axios.get(`https://${youtubeHost}/search`, {
                params: { query: `${query} Lanka Cinema Sinhala Movie`, type: 'v' },
                headers: {
                    'x-rapidapi-key': rapidApiKey,
                    'x-rapidapi-host': youtubeHost
                }
            }).catch(err => {
                console.error("YouTube Search Error:", err?.message || "Internal YouTube API Failure");
                return { data: { contents: [] } };
            });

            const [tmdbData, youtubeResponse] = await Promise.all([tmdbPromise, youtubePromise]);

            const youtubeMovies: Movie[] = [];
            if (youtubeResponse.data && youtubeResponse.data.contents) {
                youtubeResponse.data.contents.forEach((item: any) => {
                    const video = item.video;
                    if (video) {
                        youtubeMovies.push({
                            id: `yt_${video.videoId}`,
                            title: video.title,
                            original_language: 'si',
                            overview: 'Watch this exclusive Sinhala movie from Lanka Cinema.',
                            poster_path: video.thumbnails?.[0]?.url || null,
                            backdrop_path: video.thumbnails?.[0]?.url || null,
                            release_date: video.publishedTimeText,
                            vote_average: 5.0,
                            vote_count: parseInt(video.viewCountText?.replace(/[^0-9]/g, '') || '0'),
                            media_type: 'movie',
                            genre_ids: []
                        });
                    }
                });
            }

            const unifiedResults = [...tmdbData, ...youtubeMovies];
            setResults(unifiedResults);

        } catch (error: any) {
            console.error("Unified Search Error:", error?.message || "Internal Search Failure");
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
            ? 'Searching Hub & Lanka Cinema...' 
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

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
          {results.map((movie) => (
            <div key={movie.id} className="w-full">
              <MovieCard movie={movie} featured />
            </div>
          ))}
          
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
