import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Vercel ENV වලින් Firebase config එක ගන්නවා
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function generateSitemap() {
  const baseUrl = 'https://movie-hub-lk.vercel.app';
  
  // 1. Firebase එකෙන් Movies ටික ගන්නවා
  const querySnapshot = await getDocs(collection(db, "movies"));
  const movies = [];
  querySnapshot.forEach((doc) => movies.push({ id: doc.id }));

  // 2. XML එක හදනවා
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><priority>1.0</priority></url>
  <url><loc>${baseUrl}/account</loc><priority>0.5</priority></url>
  ${movies.map(movie => `
  <url>
    <loc>${baseUrl}/movie/${movie.id}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log('✅ Success: Sitemap generated in public folder!');
}

generateSitemap();
