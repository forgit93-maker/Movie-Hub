import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Sun, Moon, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const triggerPopunder = () => {
  const SCRIPT_URL = 'https://awkwardmonopoly.com/54/42/28/544228badfcc4c2bfc0469db956fed8d.js';
  if (!document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    document.body.appendChild(script);
  }
};

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(true);
  
  // Typewriter State
  const fullLogoText = "MOVIE HUB";
  const [logoDisplayText, setLogoDisplayText] = useState(fullLogoText);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useStore();

  // Logo Typewriter Animation Logic
  useEffect(() => {
    const runTypewriter = () => {
      let i = 0;
      setLogoDisplayText(""); // Clear current display
      
      const typingInterval = setInterval(() => {
        setLogoDisplayText(fullLogoText.slice(0, i + 1));
        i++;
        if (i >= fullLogoText.length) {
          clearInterval(typingInterval);
        }
      }, 150); // 150ms per letter as requested
    };

    // Initial entrance animation after a short delay
    const initialDelay = setTimeout(runTypewriter, 2000);

    // Repeat every 2 minutes (120,000 ms)
    const cycleInterval = setInterval(runTypewriter, 120000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(cycleInterval);
    };
  }, []);

  // Real-time Search Logic with Debounce
  useEffect(() => {
    if (!searchQuery.trim() && !location.pathname.includes('/search')) return;

    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, navigate, location.pathname]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        if (searchQuery.trim()) {
             triggerPopunder();
             navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (location.pathname.includes('/search') && q !== searchQuery) {
      if (q) setSearchQuery(q);
    } else if (!location.pathname.includes('/search')) {
      setSearchQuery('');
    }
  }, [location.pathname, location.search, searchQuery]);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
      if (isSearchOpen) setIsSearchOpen(false);
    };

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
    triggerPopunder();
    if (isDesktopSearchOpen) {
      if (searchQuery.trim()) {
        setSearchQuery('');
        setIsDesktopSearchOpen(false);
      } else {
        setIsDesktopSearchOpen(false);
      }
    } else {
      setIsDesktopSearchOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleLogout = async () => {
    triggerPopunder();
    await logout();
    navigate('/');
  };

  return (
    <nav className={`fixed w-full z-50 transition-colors duration-300 ${isScrolled ? 'backdrop-blur-md bg-white/90 dark:bg-black/90 shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              onClick={triggerPopunder} 
              className="text-primary font-bold text-2xl tracking-tighter hover:opacity-90 transition-opacity flex items-center relative h-8 overflow-hidden"
            >
              {/* Invisible spacer to reserve exact width and prevent layout jumping */}
              <span className="invisible pointer-events-none whitespace-pre" aria-hidden="true">{fullLogoText}</span>
              
              {/* Animated Text Layer */}
              <span className="absolute left-0 top-0 h-full flex items-center">
                {logoDisplayText}
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" onClick={triggerPopunder} className="text-gray-900 dark:text-gray-300 hover:text-primary dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
              <Link to="/movies" onClick={triggerPopunder} className="text-gray-900 dark:text-gray-300 hover:text-primary dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Movies</Link>
              <Link to="/tv" onClick={triggerPopunder} className="text-gray-900 dark:text-gray-300 hover:text-primary dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">TV Series</Link>
              {user && <Link to="/watchlist" onClick={triggerPopunder} className="text-gray-900 dark:text-gray-300 hover:text-primary dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Watchlist</Link>}
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div ref={searchContainerRef} className="hidden md:flex items-center relative justify-end">
              <div className={`relative flex items-center transition-all duration-500 ease-in-out ${isDesktopSearchOpen ? 'w-64' : 'w-8'}`}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search movies & TV..."
                  className={`
                    absolute right-0 top-1/2 -translate-y-1/2
                    h-8
                    bg-transparent 
                    text-gray-900 dark:text-white 
                    placeholder-gray-500 dark:placeholder-gray-400
                    outline-none ring-0 border-none focus:ring-0 focus:outline-none
                    transition-all duration-300
                    text-sm
                    ${isDesktopSearchOpen 
                      ? 'w-full pr-8 pl-0 opacity-100 border-b-2 border-primary' 
                      : 'w-0 opacity-0' 
                    }
                  `}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button 
                  type="button" 
                  onClick={toggleDesktopSearch}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 z-10 text-gray-600 dark:text-white hover:text-primary transition-colors"
                >
                  <Search size={20} />
                </button>
              </div>
            </div>

            <button
              onClick={() => { triggerPopunder(); setIsSearchOpen(!isSearchOpen); }}
              className="md:hidden text-gray-700 dark:text-gray-300 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              <Search size={22} />
            </button>

            <button
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              {isDark ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center space-x-3 group relative cursor-pointer" onClick={triggerPopunder}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-gray-700 shadow-md" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold shadow-md">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-200 dark:border-gray-800 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                      Signed in as <br /><span className="text-gray-900 dark:text-white font-medium truncate block">{user.email}</span>
                    </div>
                    <Link to="/profile" onClick={triggerPopunder} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Your Profile</Link>
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

      {isSearchOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full px-4 py-4 bg-white/95 dark:bg-black/95 backdrop-blur-md animate-fade-in-up z-40 border-b border-gray-200 dark:border-gray-800">
           <div className="relative">
              <input
                type="text"
                placeholder="Search movies & TV..."
                autoFocus
                className="w-full bg-transparent text-gray-900 dark:text-white border-b-2 border-primary py-2 px-2 outline-none ring-0 focus:ring-0 placeholder-gray-500 dark:placeholder-white/50 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-2 top-2 text-gray-500 dark:text-white/60">
                 <X size={18} />
              </button>
           </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;