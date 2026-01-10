import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as AppUser } from '../types';
import { auth, googleProvider, db } from '../services/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

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

  // Handle Firebase Auth & Firestore Sync
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen to Firestore changes in real-time
        const unsubscribeSnapshot = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            // User exists in Firestore, sync state
            const data = docSnap.data();
            setUser({
              id: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || 'User',
              username: data.username || firebaseUser.email?.split('@')[0] || 'user',
              email: firebaseUser.email || '',
              photoURL: data.profilePic || firebaseUser.photoURL,
              language: data.language || 'en',
              watchlist: data.watchlist || [],
              favorites: []
            });
            setWatchlist(data.watchlist || []);
          } else {
            // New user - Create Firestore Doc
            const defaultUsername = firebaseUser.email?.split('@')[0] || `user_${Date.now()}`;
            const newUser: AppUser = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || defaultUsername,
              username: defaultUsername,
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL,
              language: 'en',
              watchlist: [], 
              favorites: []
            };
            
            await setDoc(userRef, {
              username: newUser.username,
              email: newUser.email,
              name: newUser.name,
              profilePic: newUser.photoURL,
              language: 'en',
              watchlist: []
            });
            setUser(newUser);
          }
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setWatchlist([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

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
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const email = result.user.email;
        
        if (email && !email.toLowerCase().endsWith('@gmail.com')) {
          const userToDelete = auth.currentUser;
          if (userToDelete) {
             await userToDelete.delete().catch(async () => {
                 await signOut(auth);
             });
          }
          throw new Error("Only @gmail.com addresses are allowed.");
        }
    } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error("Sign in cancelled.");
        }
        throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Watchlist Functions (Now syncing to Firestore)
  const addToWatchlist = async (id: number) => {
    if (typeof id !== 'number' || !user) return;
    if (!watchlist.includes(id)) {
      const newList = [...watchlist, id];
      setWatchlist(newList);
      // Update Firestore
      await setDoc(doc(db, 'users', user.id), { watchlist: newList }, { merge: true });
    }
  };

  const removeFromWatchlist = async (id: number) => {
    if (typeof id !== 'number' || !user) return;
    const newList = watchlist.filter(itemId => itemId !== id);
    setWatchlist(newList);
    // Update Firestore
    await setDoc(doc(db, 'users', user.id), { watchlist: newList }, { merge: true });
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