import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Film, Tv, Heart, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const BottomNav: React.FC = () => {
  const { user } = useStore();

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Movies', icon: Film, path: '/movies' },
    { name: 'TV Series', icon: Tv, path: '/tv' },
    { name: 'Favorites', icon: Heart, path: '/watchlist' },
    { name: 'Account', icon: User, path: user ? '/profile' : '/login' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-black/5 dark:bg-white/10 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 pb-1 shadow-lg transition-colors duration-300">
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-300 ${
                isActive ? 'text-[#E50914]' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;