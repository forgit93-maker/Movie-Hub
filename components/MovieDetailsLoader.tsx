import React from 'react';

const MovieDetailsLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-black animate-pulse-fast">
      {/* Hero Section Skeleton */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-gray-900">
        {/* Shimmer Effect Layer */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
        
        {/* Content Overlay Placeholders */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 flex flex-col gap-4">
          {/* Title Placeholder */}
          <div className="h-10 md:h-16 w-3/4 md:w-1/2 bg-gray-700/50 rounded-lg"></div>
          
          {/* Meta Data Row */}
          <div className="flex items-center gap-3">
            <div className="h-6 w-16 bg-gray-700/50 rounded"></div>
            <div className="h-6 w-20 bg-gray-700/50 rounded"></div>
            <div className="h-6 w-12 bg-gray-700/50 rounded"></div>
            <div className="flex gap-2">
               <div className="h-6 w-16 bg-gray-700/50 rounded-full"></div>
               <div className="h-6 w-16 bg-gray-700/50 rounded-full"></div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-2">
            <div className="h-12 w-32 md:w-40 bg-red-900/30 rounded-lg border border-red-900/50"></div>
            <div className="h-12 w-32 md:w-40 bg-gray-700/30 rounded-lg border border-white/10"></div>
          </div>
        </div>
      </div>

      {/* Body Content Skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        
        {/* Overview & Tools */}
        <div className="max-w-4xl space-y-4">
           <div className="flex justify-between items-center">
              <div className="h-6 w-32 bg-gray-800 rounded"></div>
              <div className="flex gap-2">
                 <div className="h-10 w-10 rounded-full bg-gray-800"></div>
                 <div className="h-10 w-10 rounded-full bg-gray-800"></div>
              </div>
           </div>
           
           {/* Description Lines */}
           <div className="space-y-2">
             <div className="h-4 w-full bg-gray-800/50 rounded"></div>
             <div className="h-4 w-full bg-gray-800/50 rounded"></div>
             <div className="h-4 w-3/4 bg-gray-800/50 rounded"></div>
             <div className="h-4 w-1/2 bg-gray-800/50 rounded"></div>
           </div>

           {/* Director Line */}
           <div className="flex items-center gap-2 pt-2">
              <div className="h-3 w-16 bg-gray-800 rounded"></div>
              <div className="h-3 w-32 bg-gray-800/70 rounded"></div>
           </div>
        </div>

        {/* Cast Section */}
        <div>
           <div className="h-6 w-24 bg-gray-800 rounded mb-4 border-l-4 border-gray-700 pl-3"></div>
           <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 7 }).map((_, i) => (
                 <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gray-800 border-2 border-gray-700"></div>
                    <div className="h-3 w-20 bg-gray-800/50 rounded"></div>
                 </div>
              ))}
           </div>
        </div>

        {/* Player Placeholder */}
        <div className="w-full aspect-video bg-gray-900 rounded-xl border border-gray-800 relative overflow-hidden">
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-16 h-16 rounded-full border-4 border-gray-700"></div>
             </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default MovieDetailsLoader;