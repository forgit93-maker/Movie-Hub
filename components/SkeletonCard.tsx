import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="w-[160px] md:w-[200px] flex-shrink-0">
      {/* Aspect Ratio 2:3 to match MovieCard */}
      <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse relative overflow-hidden">
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent"></div>
      </div>
      <div className="mt-2 space-y-2">
         {/* Title skeleton */}
         <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse"></div>
         {/* Meta skeleton */}
         <div className="flex justify-between">
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4 animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4 animate-pulse"></div>
         </div>
      </div>
    </div>
  );
};

export default SkeletonCard;