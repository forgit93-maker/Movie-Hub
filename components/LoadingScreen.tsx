import React, { useEffect, useState } from 'react';

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress bar filling up over ~2.5 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Random increment between 1 and 8 to make it feel organic
        const increment = Math.random() * 8 + 1;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const text = "MOVIE HUB";

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Text Container */}
      <div className="relative flex items-center justify-center mb-12">
        {text.split('').map((char, index) => (
          <span
            key={index}
            className="text-6xl md:text-9xl font-black text-primary inline-block opacity-0 animate-letter-pop"
            style={{
              // Stagger animation for each letter
              animationDelay: `${index * 0.15}s`,
              // Neon glow effect
              textShadow: '0 0 25px rgba(229, 9, 20, 0.7), 0 0 50px rgba(229, 9, 20, 0.3)',
              marginRight: char === ' ' ? '2rem' : '0.2rem',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            {char}
          </span>
        ))}
      </div>
      
      {/* Progress Bar Container */}
      <div className="absolute bottom-16 w-64 md:w-96 h-1 bg-gray-900 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-200 ease-out shadow-[0_0_15px_#e50914]"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Loading Percentage (Optional - aesthetic choice to keep it minimal) */}
      <div className="absolute bottom-10 text-gray-500 text-xs font-mono tracking-widest">
        LOADING RESOURCES...
      </div>

      {/* Custom Keyframes for this component */}
      <style>{`
        @keyframes letter-pop {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(40px);
            filter: blur(10px);
          }
          60% {
            opacity: 1;
            transform: scale(1.1) translateY(-10px);
            filter: blur(0px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0px);
          }
        }
        .animate-letter-pop {
          animation: letter-pop 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;