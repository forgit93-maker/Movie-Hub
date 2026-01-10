import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const doSearch = async () => {
      if (query) {
        setLoading(true);
        try {
            const data = await tmdbService.searchMulti(query);
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
      } else {
        setResults([]);
      }
    };
    doSearch();
  }, [query]);

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 px-4 md:px-8 lg:px-12 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
          {loading 
            ? 'Searching...' 
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

        {/* Responsive Grid Layout: Mobile 2, Tablet 4, Desktop 6 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
          {results.map((movie) => (
            <div key={movie.id} className="w-full">
              <MovieCard movie={movie} featured />
            </div>
          ))}
          
          {/* Skeleton Loading State */}
          {loading && Array.from({ length: 12 }).map((_, i) => (
             <div key={i} className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;