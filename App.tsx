import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
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

function App() {
  // Initialize Theme
  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <LanguageProvider>
      <StoreProvider>
        <Router>
          {/* Global wrapper with Theme-based Background and Text colors */}
          <div className="min-h-screen font-sans transition-colors duration-300 bg-white text-gray-900 dark:bg-black dark:text-white flex flex-col">
            <Navbar />
            
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movies" element={<Movies />} /> 
                <Route path="/tv" element={<TVSeries />} /> 
                <Route path="/details/:type/:id" element={<Details />} />
                <Route path="/search" element={<Search />} />
                <Route path="/login" element={<Login />} />
                <Route path="/blog" element={<Blog />} />
                
                {/* Protected Routes - Split into Favorites (Watchlist) and Account (Profile) */}
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
            <Footer />
          </div>
        </Router>
      </StoreProvider>
    </LanguageProvider>
  );
}

export default App;