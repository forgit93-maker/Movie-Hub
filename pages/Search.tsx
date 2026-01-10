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
        const data = await tmdbService.searchMulti(query);
        setResults(data);
        setLoading(false);
      }
    };
    doSearch();
  }, [query]);

  return (
    <div className="min-h-screen bg-dark pt-20 px-6 md:px-12 pb-12">
      <h2 className="text-2xl text-white mb-6">
        {loading ? 'Searching...' : `Results for "${query}"`}
      </h2>
      
      {!loading && results.length === 0 && (
        <p className="text-gray-400">No results found.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {results.map((movie) => (
          <div key={movie.id} className="w-full">
            <MovieCard movie={movie} featured />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
