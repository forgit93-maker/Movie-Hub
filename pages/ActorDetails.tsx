
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Cake, MapPin, ChevronDown, ChevronUp, Instagram, Facebook, Twitter, Globe } from 'lucide-react';
import { tmdbService, getImageUrl } from '../services/tmdb';
import { PersonDetails, Movie, PersonExternalIds } from '../types';
import MovieCard from '../components/MovieCard';

const ActorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [externalIds, setExternalIds] = useState<PersonExternalIds | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (id) {
        try {
          const personId = parseInt(id);
          const [details, credits, ids] = await Promise.all([
            tmdbService.getPerson(personId),
            tmdbService.getPersonCredits(personId),
            tmdbService.getPersonExternalIds(personId)
          ]);

          setPerson(details);
          setExternalIds(ids);

          // Sort by popularity to show "Highlights" first
          const sortedCast = credits.cast.sort((a, b) => b.vote_count - a.vote_count);
          
          // Filter out duplicates based on ID
          const uniqueMovies = Array.from(new Map(sortedCast.filter(item => item.media_type === 'movie').map(item => [item.id, item])).values());
          const uniqueTv = Array.from(new Map(sortedCast.filter(item => item.media_type === 'tv').map(item => [item.id, item])).values());

          setMovies(uniqueMovies);
          setTvShows(uniqueTv);
        } catch (error) {
          console.error("Failed to load actor details", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-20 px-6 animate-pulse">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
           <div className="w-40 h-40 rounded-full bg-gray-200 dark:bg-gray-800 mb-6 border-4 border-gray-100 dark:border-gray-900"></div>
           <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
           <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-8"></div>
           <div className="h-16 w-full max-w-sm bg-gray-200 dark:bg-gray-800 rounded-xl mb-8"></div>
           <div className="space-y-3 w-full">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
           </div>
        </div>
      </div>
    );
  }

  if (!person) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20 transition-colors duration-300">
      
      {/* Navbar Area Placeholder / Back Button */}
      <div className="pt-20 px-6 max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-gray-100 dark:bg-gray-900 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors shadow-sm group border border-gray-200 dark:border-gray-800"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-4 animate-fade-in-up">
        
        {/* Profile Header - Minimalist & Centered */}
        <div className="flex flex-col items-center text-center">
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-90 group-hover:scale-100 transition-transform duration-500"></div>
            
            <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full p-1.5 bg-gradient-to-tr from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 shadow-2xl overflow-hidden mb-6 ring-1 ring-black/5 dark:ring-white/10">
               <img 
                 src={getImageUrl(person.profile_path, 'w500')} 
                 alt={person.name} 
                 className="w-full h-full object-cover rounded-full"
               />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            {person.name}
          </h1>
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-6 border-b-2 border-primary/20 pb-1">
            {person.known_for_department}
          </p>

          {/* Social Media Links (Cute Row) */}
          {externalIds && (
            <div className="flex gap-4 mb-8">
               {externalIds.instagram_id && (
                 <a href={`https://instagram.com/${externalIds.instagram_id}`} target="_blank" rel="noreferrer" className="p-3 bg-pink-500/10 text-pink-500 rounded-full hover:bg-pink-500 hover:text-white transition-all hover:scale-110">
                   <Instagram size={20} />
                 </a>
               )}
               {externalIds.twitter_id && (
                 <a href={`https://twitter.com/${externalIds.twitter_id}`} target="_blank" rel="noreferrer" className="p-3 bg-blue-400/10 text-blue-400 rounded-full hover:bg-blue-400 hover:text-white transition-all hover:scale-110">
                   <Twitter size={20} />
                 </a>
               )}
               {externalIds.facebook_id && (
                 <a href={`https://facebook.com/${externalIds.facebook_id}`} target="_blank" rel="noreferrer" className="p-3 bg-blue-600/10 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all hover:scale-110">
                   <Facebook size={20} />
                 </a>
               )}
               {externalIds.imdb_id && (
                 <a href={`https://imdb.com/name/${externalIds.imdb_id}`} target="_blank" rel="noreferrer" className="p-3 bg-yellow-500/10 text-yellow-500 rounded-full hover:bg-yellow-500 hover:text-white transition-all hover:scale-110">
                   <Globe size={20} />
                 </a>
               )}
            </div>
          )}

          {/* Info Card */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 bg-gray-50 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-800 px-8 py-5 rounded-2xl shadow-sm mb-10 w-full md:w-auto">
             {person.birthday && (
               <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                 <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-full text-pink-500">
                    <Cake size={18} />
                 </div>
                 <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Born</p>
                    <p className="font-medium">{new Date(person.birthday).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                 </div>
               </div>
             )}
             {person.place_of_birth && (
               <>
                 <div className="hidden md:block w-px h-8 bg-gray-300 dark:bg-gray-700"></div>
                 <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                   <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-500">
                     <MapPin size={18} />
                   </div>
                   <div className="text-left">
                     <p className="text-[10px] uppercase font-bold text-gray-400">From</p>
                     <p className="font-medium">{person.place_of_birth}</p>
                   </div>
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Biography Section */}
        <div className="mb-12 bg-gray-50 dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-800/50">
           <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Biography</h2>
           <div className="relative">
             <p className={`text-gray-600 dark:text-gray-300 leading-relaxed text-base md:text-lg font-light transition-all duration-500 ${isBioExpanded ? '' : 'line-clamp-4'}`}>
               {person.biography || "No biography available for this actor."}
             </p>
             {person.biography && person.biography.length > 400 && (
               <button 
                 onClick={() => setIsBioExpanded(!isBioExpanded)}
                 className="mt-3 flex items-center gap-1 text-sm font-bold text-primary hover:text-red-400 transition-colors"
               >
                 {isBioExpanded ? (
                   <>Read Less <ChevronUp size={16} /></>
                 ) : (
                   <>Read More <ChevronDown size={16} /></>
                 )}
               </button>
             )}
           </div>
        </div>

        {/* Filmography - Row 1: Movies */}
        {movies.length > 0 && (
          <div className="mb-12 space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">✨</span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Movies</h3>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-6 hide-scrollbar scroll-smooth -mx-6 px-6">
               {movies.slice(0, 15).map(movie => (
                 <div key={movie.id} className="w-[150px] md:w-[180px] flex-shrink-0">
                    <MovieCard movie={{...movie, media_type: 'movie'}} />
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Filmography - Row 2: TV */}
        {tvShows.length > 0 && (
          <div className="mb-12 space-y-4">
             <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📺</span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">TV Appearances</h3>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-6 hide-scrollbar scroll-smooth -mx-6 px-6">
               {tvShows.slice(0, 15).map(show => (
                 <div key={show.id} className="w-[150px] md:w-[180px] flex-shrink-0">
                    <MovieCard movie={{...show, media_type: 'tv'}} />
                 </div>
               ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ActorDetails;
