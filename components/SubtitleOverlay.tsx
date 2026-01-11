import React, { useMemo } from 'react';
import { SubtitleCue } from '../utils/subtitleHelper';

interface SubtitleOverlayProps {
  cues: SubtitleCue[];
  currentTime: number; // Current playback time in seconds
  offset: number; // Synchronization offset in seconds
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ cues, currentTime, offset }) => {
  // Calculate the effective time for subtitle lookup
  const adjustedTime = currentTime - offset;

  // Find the active cue
  // Using useMemo to optimize performance since render loop is fast
  const activeCue = useMemo(() => {
    return cues.find(cue => adjustedTime >= cue.startTime && adjustedTime <= cue.endTime);
  }, [cues, adjustedTime]);

  if (!activeCue) return null;

  return (
    <div 
      className="absolute inset-0 z-20 flex flex-col justify-end items-center pb-12 md:pb-16 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <div className="px-6 text-center">
        <span 
          className="text-white text-lg md:text-2xl font-medium tracking-wide"
          style={{
            textShadow: `
              -2px -2px 0 #000,  
               2px -2px 0 #000,
              -2px  2px 0 #000,
               2px  2px 0 #000,
               0px 2px 4px rgba(0,0,0,0.8)
            `,
            backgroundColor: 'rgba(0,0,0,0.4)',
            padding: '4px 12px',
            borderRadius: '4px',
            boxDecorationBreak: 'clone',
            WebkitBoxDecorationBreak: 'clone'
          }}
        >
          {activeCue.text.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < activeCue.text.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </span>
      </div>
    </div>
  );
};

export default SubtitleOverlay;