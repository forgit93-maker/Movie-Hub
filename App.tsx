import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { LanguageProvider } from './context/LanguageContext';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVSeries from './pages/TVSeries';
import Details from './pages/Details';
import Login from './pages/Login';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import Account from './pages/Account';
import Blog from './pages/Blog';
import ProtectedRoute from './components/ProtectedRoute';

// Layout component to handle location-based styles inside the Router context
const AppLayout: React.FC = () => {
  const location = useLocation();
  
  // Define pages where Footer is hidden (Account & Favorites)
  // We check for /profile (Account) and /watchlist (Favorites) as these are the actual routes
  const isFooterHidden = ['/profile', '/watchlist', '/account', '/favorites'].includes(location.pathname);

  return (
    <div className="min-h-screen font-sans transition-colors duration-300 bg-white text-gray-900 dark:bg-black dark:text-white flex flex-col">
      <Navbar />
      
      {/* Add extra padding-bottom if footer is hidden to prevent BottomNav overlap on mobile.
          If footer is visible, it has its own padding to accommodate the bottom nav. */}
      <main className={`flex-grow ${isFooterHidden ? 'pb-24' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} /> 
          <Route path="/tv" element={<TVSeries />} /> 
          <Route path="/details/:type/:id" element={<Details />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/blog" element={<Blog />} />
          
          {/* Protected Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/watchlist" 
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      
      <BottomNav />
      {/* Conditionally render Footer */}
      {!isFooterHidden && <Footer />}
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Theme & Loading State
  useEffect(() => {
    // 1. Theme Setup
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Loading Screen Timer (2.5 seconds)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Show Loading Screen before mounting the main app
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <HelmetProvider>
      <LanguageProvider>
        <StoreProvider>
          <Router>
            <AppLayout />
          </Router>
        </StoreProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;