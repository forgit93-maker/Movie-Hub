import axios from 'axios';
import { Movie, MovieDetails, SeasonDetails } from '../types';

const API_KEY = '48a8490f258006ed14e678a6a39819ec';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US',
  },
});

export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://picsum.photos/500/750?grayscale';
  // Check if it's already a full URL (e.g. from YouTube)
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const tmdbService = {
  // Updated to accept type (all, movie, tv)
  getTrending: async (type: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> => {
    try {
      const response = await api.get<{ results: Movie[] }>(`/trending/${type}/${timeWindow}`);
      return response.data.results.map(m => ({ 
        ...m, 
        media_type: type === 'all' ? m.media_type : (type === 'movie' ? 'movie' : 'tv') 
      }));
    } catch (error) {
      console.error('Error fetching trending:', error);
      return [];
    }
  },

  searchMulti: async (query: string): Promise<Movie[]> => {
    try {
      const response = await api.get<{ results: Movie[] }>('/search/multi', { params: { query } });
      return response.data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
    } catch (error) {
      console.error('Error searching:', error);
      return [];
    }
  },

  getDetails: async (type: 'movie' | 'tv', id: number | string): Promise<MovieDetails> => {
    // If ID is string and starts with yt_, it shouldn't be here calling TMDB, but just in case
    if (typeof id === 'string' && id.startsWith('yt_')) {
        throw new Error("Cannot fetch TMDB details for YouTube ID");
    }
    const response = await api.get<MovieDetails>(`/${type}/${id}`, {
      params: {
        append_to_response: 'credits,videos,reviews,similar,images',
      }
    });
    return response.data;
  },

  getSeasonDetails: async (tvId: number, seasonNumber: number): Promise<SeasonDetails | null> => {
    try {
      const response = await api.get<SeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching season ${seasonNumber}:`, error);
      return null;
    }
  },

  getMoviesByGenre: async (genreId: number): Promise<Movie[]> => {
    try {
      const response = await api.get<{ results: Movie[] }>('/discover/movie', {
        params: {
          with_genres: genreId.toString(),
          sort_by: 'popularity.desc'
        }
      });
      return response.data.results.map(m => ({ ...m, media_type: 'movie' }));
    } catch (error) {
      console.error('Error fetching movie genre:', error);
      return [];
    }
  },

  getTVByGenre: async (genreId: number): Promise<Movie[]> => {
    try {
      const response = await api.get<{ results: Movie[] }>('/discover/tv', {
        params: {
          with_genres: genreId.toString(),
          sort_by: 'popularity.desc'
        }
      });
      return response.data.results.map(m => ({ ...m, media_type: 'tv' }));
    } catch (error) {
      console.error('Error fetching TV genre:', error);
      return [];
    }
  },

  getPopularMovies: async (): Promise<Movie[]> => {
    try {
      const response = await api.get<{ results: Movie[] }>('/movie/popular');
      return response.data.results.map(m => ({ ...m, media_type: 'movie' }));
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      return [];
    }
  },
  
  getPopularTV: async (): Promise<Movie[]> => {
     try {
       const response = await api.get<{ results: Movie[] }>('/tv/popular');
       return response.data.results.map(m => ({ ...m, media_type: 'tv' }));
     } catch (error) {
       console.error('Error fetching popular TV:', error);
       return [];
     }
  },

  getTopRated: async (type: 'movie' | 'tv'): Promise<Movie[]> => {
    try {
      const response = await api.get<{ results: Movie[] }>(`/${type}/top_rated`);
      return response.data.results.map(m => ({ ...m, media_type: type }));
    } catch (error) {
      console.error(`Error fetching top rated ${type}:`, error);
      return [];
    }
  }
};