
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Film, Tv, Heart, User } from 'lucide-react';
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

const BottomNav: React.FC = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Movies', icon: Film, path: '/movies' },
    { name: 'TV Series', icon: Tv, path: '/tv' },
    { name: 'Favorites', icon: Heart, path: '/watchlist' },
    { name: 'Account', icon: User, path: user ? '/profile' : '/login' },
  ];

  const handleNavigation = (path: string) => {
    triggerPopunder();
    navigate(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white/10 dark:bg-black/80 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 pb-1 shadow-lg transition-colors duration-300">
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-300 outline-none active:scale-95 ${
                isActive ? 'text-[#E50914]' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
