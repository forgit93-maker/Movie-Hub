export interface SubtitleCue {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

const timeToSeconds = (timeString: string): number => {
  const parts = timeString.split(':');
  let seconds = 0;
  let minutes = 0;
  let hours = 0;
  let milliseconds = 0;

  if (parts.length === 3) {
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
    
    const secParts = parts[2].split(/[,\.]/);
    seconds = parseInt(secParts[0], 10);
    milliseconds = parseInt(secParts[1], 10);
  } else if (parts.length === 2) {
    minutes = parseInt(parts[0], 10);
    const secParts = parts[1].split(/[,\.]/);
    seconds = parseInt(secParts[0], 10);
    milliseconds = parseInt(secParts[1], 10);
  }

  return (hours * 3600) + (minutes * 60) + seconds + (milliseconds / 1000);
};

export const parseSubtitle = (content: string): SubtitleCue[] => {
  const cues: SubtitleCue[] = [];
  // Normalize line endings
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalizedContent.split('\n\n');

  blocks.forEach((block, index) => {
    const lines = block.trim().split('\n');
    if (lines.length >= 2) {
      // Handle index line if present (SRT has it, VTT might not)
      let timeLineIndex = 0;
      if (lines[0].match(/^\d+$/)) {
        timeLineIndex = 1;
      } else if (lines[0].includes('-->')) {
        timeLineIndex = 0;
      } else {
        return; // Invalid block
      }

      if (!lines[timeLineIndex]) return;

      const timeMatch = lines[timeLineIndex].match(/(\d{2}:\d{2}:\d{2}[,\.]\d{3}) --> (\d{2}:\d{2}:\d{2}[,\.]\d{3})/);
      
      if (timeMatch) {
        const startTime = timeToSeconds(timeMatch[1]);
        const endTime = timeToSeconds(timeMatch[2]);
        // Join the rest of the lines as text
        const text = lines.slice(timeLineIndex + 1).join('\n').replace(/<[^>]*>/g, ''); // Remove HTML tags if any

        cues.push({
          id: `cue-${index}`,
          startTime,
          endTime,
          text
        });
      }
    }
  });

  return cues;
};