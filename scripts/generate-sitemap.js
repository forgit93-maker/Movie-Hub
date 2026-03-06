const fs = require('fs');
const axios = require('axios');

async function generateSitemap() {
  const baseUrl = 'https://movie-hub-lk.vercel.app';
  
  try {
    // 1. ඔයාගේ API එකෙන් Movies සහ Series IDs ටික ගන්න
    // මෙතන process.env.REACT_APP_API_URL වගේ ඔයා Vercel එකේ දාපු variable එක පාවිච්චි කරන්න
    const response = await axios.get(`${process.env.API_URL}/movies`); 
    const items = response.data; // මෙතන ඔයාගේ API response එක අනුව වෙනස් වෙන්න පුළුවන්

    const movieUrls = items.map(item => `
      <url>
        <loc>${baseUrl}/movie/${item.id}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/account</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.5</priority>
  </url>
  ${movieUrls}
</urlset>`;

    // Sitemap එක කෙලින්ම public folder එකට ලියනවා
    fs.writeFileSync('public/sitemap.xml', sitemap);
    console.log('✅ Sitemap generated successfully!');
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
  }
}

generateSitemap();
