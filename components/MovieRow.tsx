import React from 'react';
import { Movie } from '../types';
import MovieCard from './MovieCard';
import SkeletonCard from './SkeletonCard';
import { ChevronRight } from 'lucide-react';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  loading?: boolean;
}

const MovieRow: React.FC<MovieRowProps> = ({ title, movies, loading = false }) => {
  
  if (!loading && (!movies || movies.length === 0)) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white hover:text-primary cursor-pointer flex items-center group transition-colors">
        {title} 
        <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-sm text-primary flex items-center font-normal">
          Explore All <ChevronRight size={16} />
        </span>
      </h2>
      
      <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-8 hide-scrollbar scroll-smooth pr-6">
        {loading ? (
          // Render 6 Skeleton Cards
          Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))
        ) : (
          movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        )}
      </div>
    </div>
  );
};

export default MovieRow;