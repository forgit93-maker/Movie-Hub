import React from 'react';
import { Movie } from '../types';
import MovieCard from './MovieCard';
import { ChevronRight } from 'lucide-react';

interface SectionRowProps {
  title: string;
  movies: Movie[];
}

const SectionRow: React.FC<SectionRowProps> = ({ title, movies }) => {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold text-white hover:text-primary cursor-pointer flex items-center group">
        {title} 
        <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-sm text-primary flex items-center font-normal">
          Explore All <ChevronRight size={16} />
        </span>
      </h2>
      <div className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-8 hide-scrollbar scroll-smooth pr-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default SectionRow;