import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDh28eOJuOzAxCCK6W3j1oj3Aj7phk49sc",
  authDomain: "movie-f513f.firebaseapp.com",
  projectId: "movie-f513f",
  storageBucket: "movie-f513f.firebasestorage.app",
  messagingSenderId: "946477933284",
  appId: "1:946477933284:web:2eec028010d0d2f752c2f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;