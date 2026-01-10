import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, User as UserIcon } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Mobile toggle
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false); // Desktop toggle
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(true);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();
  const { user, logout } = useStore();

  useEffect(() => {
    // Sync state with DOM on mount
    setIsDark(document.documentElement.classList.contains('dark'));

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
      if (isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    // Handle click outside for desktop search
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        if (isDesktopSearchOpen && !searchQuery) {
          setIsDesktopSearchOpen(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen, isDesktopSearchOpen, searchQuery]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const toggleDesktopSearch = () => {
    if (isDesktopSearchOpen) {
      if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        setIsDesktopSearchOpen(false); 
      } else {
        setIsDesktopSearchOpen(false);
      }
    } else {
      setIsDesktopSearchOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setIsDesktopSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={`fixed w-full z-50 transition-colors duration-300 ${isScrolled ? 'backdrop-blur-md bg-white/90 dark:bg-black/90 shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-primary font-bold text-2xl tracking-tighter">MOVIE HUB</Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="text-gray-900 dark:text-gray-300 hover:text-primary dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
              <Link to="/movies" className="text-gray-900 dark:text-gray-300 hover:text-primary dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Movies</Link>
              <Link to="/tv" className="text-gray-900 dark:text-gray-300 hover:text-primary dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">TV Series</Link>
              {user && <Link to="/watchlist" className="text-gray-900 dark:text-gray-300 hover:text-primary dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Watchlist</Link>}
            </div>
          </div>

          {/* Actions: Search, Theme, Profile */}
          <div className="flex items-center space-x-2 md:space-x-4">
            
            {/* Desktop Expanding Search */}
            <div ref={searchContainerRef} className="hidden md:flex items-center relative justify-end">
              <form onSubmit={handleSearch} className={`relative flex items-center transition-all duration-500 ease-in-out ${isDesktopSearchOpen ? 'w-64' : 'w-8'}`}>
                {/* Minimalist Input: No Frames, No Background, Bottom Border only */}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  className={`
                    absolute right-0 top-1/2 -translate-y-1/2
                    h-8
                    bg-transparent 
                    text-gray-900 dark:text-white 
                    placeholder-gray-500 dark:placeholder-gray-400
                    outline-none ring-0 border-none
                    transition-all duration-300
                    ${isDesktopSearchOpen 
                      ? 'w-full pr-8 pl-0 opacity-100 border-b-2 border-primary' // Visible state
                      : 'w-0 opacity-0' // Hidden state
                    }
                  `}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={toggleDesktopSearch}
                  className={`
                    absolute right-0 top-1/2 -translate-y-1/2
                    p-1 z-10
                    text-gray-600 dark:text-white 
                    hover:text-primary 
                    transition-colors
                  `}
                >
                  <Search size={20} />
                </button>
              </form>
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden text-gray-700 dark:text-gray-300 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              <Search size={22} />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            {/* User Profile */}
            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center space-x-3 group relative cursor-pointer">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full object-cover border border-gray-700 shadow-md"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold shadow-md">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-200 dark:border-gray-800">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                      Signed in as <br /><span className="text-gray-900 dark:text-white font-medium truncate block">{user.email}</span>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Your Profile</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Sign out</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="bg-primary text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-red-700 transition shadow-md shadow-red-600/20">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (Overlay) */}
      {isSearchOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full px-4 py-4 bg-transparent backdrop-blur-md animate-fade-in-up z-40">
           <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search movies & TV..."
                autoFocus
                className="w-full bg-transparent text-gray-900 dark:text-white border-b-2 border-primary py-2 px-2 outline-none ring-0 placeholder-gray-500 dark:placeholder-white/50 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-2 top-2 text-gray-500 dark:text-white/60">
                 <Search size={18} />
              </button>
           </form>
        </div>
      )}
    </nav>
  );
};

export default Navbar;