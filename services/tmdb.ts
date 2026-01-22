
import axios from 'axios';
import { Movie, MovieDetails, SeasonDetails, PersonDetails, PersonExternalIds } from '../types';

const API_KEY = '48a8490f258006ed14e678a6a39819ec';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US',
  },
});

export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://picsum.photos/500/750?grayscale';
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const tmdbService = {
  getTrending: async (type: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> => {
    try {
      const response = await api.get<{ results: Movie[] }>(`/trending/${type}/${timeWindow}`);
      return response.data.results.map(m => ({ 
        ...m, 
        media_type: type === 'all' ? m.media_type : (type === 'movie' ? 'movie' : 'tv') 
      }));
    } catch (error: any) {
      console.error('TMDB Trending Error:', error?.message || 'Unknown network error');
      return [];
    }
  },

  searchMulti: async (query: string): Promise<Movie[]> => {
    try {
      const response = await api.get<{ results: Movie[] }>('/search/multi', { params: { query } });
      return response.data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
    } catch (error: any) {
      console.error('TMDB Search Error:', error?.message || 'Unknown network error');
      return [];
    }
  },

  getDetails: async (type: 'movie' | 'tv', id: number | string): Promise<MovieDetails> => {
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
    } catch (error: any) {
      console.error(`TMDB Season Error:`, error?.message || 'Unknown network error');
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
    } catch (error: any) {
      console.error('TMDB Genre Error:', error?.message || 'Unknown network error');
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
    } catch (error: any) {
      console.error('TMDB TV Genre Error:', error?.message || 'Unknown network error');
      return [];
    }
  },

  getPopularMovies: async (): Promise<Movie[]> => {
    try {
      const response = await api.get<{ results: Movie[] }>('/movie/popular');
      return response.data.results.map(m => ({ ...m, media_type: 'movie' }));
    } catch (error: any) {
      console.error('TMDB Popular Movies Error:', error?.message || 'Unknown network error');
      return [];
    }
  },
  
  getPopularTV: async (): Promise<Movie[]> => {
     try {
       const response = await api.get<{ results: Movie[] }>('/tv/popular');
       return response.data.results.map(m => ({ ...m, media_type: 'tv' }));
     } catch (error: any) {
       console.error('TMDB Popular TV Error:', error?.message || 'Unknown network error');
       return [];
     }
  },

  getTopRated: async (type: 'movie' | 'tv'): Promise<Movie[]> => {
    try {
      const response = await api.get<{ results: Movie[] }>(`/${type}/top_rated`);
      return response.data.results.map(m => ({ ...m, media_type: type }));
    } catch (error: any) {
      console.error(`TMDB Top Rated Error:`, error?.message || 'Unknown network error');
      return [];
    }
  },

  getPerson: async (id: number): Promise<PersonDetails> => {
    const response = await api.get<PersonDetails>(`/person/${id}`);
    return response.data;
  },

  getPersonExternalIds: async (id: number): Promise<PersonExternalIds> => {
    const response = await api.get<PersonExternalIds>(`/person/${id}/external_ids`);
    return response.data;
  },

  getPersonCredits: async (id: number): Promise<{ cast: Movie[] }> => {
    const response = await api.get<{ cast: Movie[] }>(`/person/${id}/combined_credits`);
    return response.data;
  }
};
