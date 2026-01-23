
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com/
// 2. Create a project or select your existing one.
// 3. Go to Project Settings > General > Your apps > SDK setup and configuration.
// 4. Copy the "firebaseConfig" object and paste it below.
// 5. IMPORTANT: Go to "Authentication" > "Sign-in method" in the console 
//    and enable "Google" provider.
// ------------------------------------------------------------------

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
export const db = getFirestore(app);

// Initialize Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
