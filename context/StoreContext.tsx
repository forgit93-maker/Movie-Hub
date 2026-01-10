import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as AppUser } from '../types';
import { auth, googleProvider } from '../services/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';

interface StoreContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  watchlist: number[];
  addToWatchlist: (id: number) => void;
  removeFromWatchlist: (id: number) => void;
  isWatchlisted: (id: number) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle Firebase Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Map Firebase User to App User
        const newUser: AppUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL,
          watchlist: [], // In a real app, fetch this from Firestore
          favorites: []
        };
        setUser(newUser);
        
        // Load local watchlist as a temporary measure (ideally syncs with Firestore)
        const storedWatchlist = localStorage.getItem(`moviehub_watchlist_${firebaseUser.uid}`);
        if (storedWatchlist) {
            try {
                const parsed = JSON.parse(storedWatchlist);
                if (Array.isArray(parsed)) setWatchlist(parsed.filter(i => typeof i === 'number'));
            } catch(e) { console.error(e); }
        }
      } else {
        setUser(null);
        setWatchlist([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save Watchlist to Local Storage (Per User)
  const saveWatchlistToStorage = (list: number[]) => {
    if (user) {
        try {
            const cleanList = list.filter(item => typeof item === 'number');
            localStorage.setItem(`moviehub_watchlist_${user.id}`, JSON.stringify(cleanList));
        } catch (error) {
            console.error("Failed to save watchlist:", error);
        }
    }
  };

  // Auth Functions
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    if (!email.trim().toLowerCase().endsWith('@gmail.com')) {
      throw new Error("Only @gmail.com addresses are allowed for registration.");
    }
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const googleSignIn = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user.email && !result.user.email.toLowerCase().endsWith('@gmail.com')) {
      // If the Google account is not a gmail address, sign them out immediately
      await signOut(auth);
      throw new Error("Only @gmail.com addresses are allowed.");
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Watchlist Functions
  const addToWatchlist = (id: number) => {
    if (typeof id !== 'number') return;
    if (!watchlist.includes(id)) {
      const newList = [...watchlist, id];
      setWatchlist(newList);
      saveWatchlistToStorage(newList);
    }
  };

  const removeFromWatchlist = (id: number) => {
    if (typeof id !== 'number') return;
    const newList = watchlist.filter(itemId => itemId !== id);
    setWatchlist(newList);
    saveWatchlistToStorage(newList);
  };

  const isWatchlisted = (id: number) => watchlist.includes(id);

  return (
    <StoreContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      googleSignIn, 
      logout, 
      watchlist, 
      addToWatchlist, 
      removeFromWatchlist, 
      isWatchlisted 
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};