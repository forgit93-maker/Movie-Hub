
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
import ActorDetails from './pages/ActorDetails';
import ProtectedRoute from './components/ProtectedRoute';

const AppLayout: React.FC = () => {
  const location = useLocation();
  
  const isAuthPage = location.pathname === '/login';
  const isFooterHidden = ['/profile', '/watchlist', '/account', '/favorites', '/login'].includes(location.pathname);

  return (
    <div className="min-h-screen font-sans transition-colors duration-300 bg-white text-gray-900 dark:bg-black dark:text-white flex flex-col">
      {!isAuthPage && <Navbar />}
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} /> 
          <Route path="/tv" element={<TVSeries />} /> 
          <Route path="/details/:type/:id" element={<Details />} />
          <Route path="/actor/:id" element={<ActorDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/blog" element={<Blog />} />
          
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
      
      {!isAuthPage && <BottomNav />}
      {!isFooterHidden && <Footer />}
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

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
