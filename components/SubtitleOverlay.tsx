
import React, { useMemo } from 'react';
import { SubtitleCue } from '../utils/subtitleHelper';
import { SubtitleStyle } from '../types';

interface SubtitleOverlayProps {
  cues: SubtitleCue[];
  currentTime: number;
  offset: number;
  style: SubtitleStyle;
  isLandscape?: boolean;
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ cues, currentTime, offset, style, isLandscape }) => {
  const adjustedTime = currentTime - offset;

  const activeCue = useMemo(() => {
    return cues.find(cue => adjustedTime >= cue.startTime && adjustedTime <= cue.endTime);
  }, [cues, adjustedTime]);

  if (!activeCue) return null;

  const textStyle: React.CSSProperties = {
    color: style.color,
    fontSize: isLandscape ? `${style.fontSize * 1.3}px` : `${style.fontSize}px`,
    backgroundColor: style.backgroundColor,
    textShadow: style.hasShadow 
      ? `-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 2px 2px 4px rgba(0,0,0,0.8)` 
      : 'none',
    padding: style.backgroundColor !== 'transparent' ? '4px 12px' : '2px 4px',
    borderRadius: '6px',
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
    textAlign: 'center',
    lineHeight: '1.4',
    fontFamily: 'Arial, sans-serif', 
    fontWeight: 600,
  };

  return (
    <div 
      className={`absolute inset-x-0 ${isLandscape ? 'bottom-[5%] fixed' : 'bottom-[10%]'} flex flex-col items-center justify-end pointer-events-none p-4`}
      style={{ zIndex: 2147483647 }}
      aria-hidden="true"
    >
      <div style={{ opacity: style.opacity }}>
        <span style={textStyle}>
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
