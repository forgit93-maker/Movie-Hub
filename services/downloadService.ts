import axios from 'axios';

const RAPID_API_KEY = 'bc98d5efd1msh9568cc76df1a18fp1a7e90jsnf632bef6dec7';
const RAPID_API_HOST = 'youtube-media-downloader.p.rapidapi.com';

export interface DownloadFormat {
  quality: string;
  container: string;
  size?: string;
  url: string;
  hasAudio: boolean;
  isAudioOnly: boolean;
}

export const fetchYoutubeDownloads = async (videoId: string): Promise<DownloadFormat[]> => {
  try {
    const response = await axios.get(`https://${RAPID_API_HOST}/v2/video/details`, {
      params: { videoId: videoId },
      headers: {
        'x-rapidapi-key': RAPID_API_KEY,
        'x-rapidapi-host': RAPID_API_HOST
      }
    });

    const data = response.data;
    const formats: DownloadFormat[] = [];

    // Parse Videos
    if (data.videos && data.videos.items) {
      data.videos.items.forEach((item: any) => {
        if (item.url) {
          formats.push({
            quality: item.quality || 'Unknown',
            container: item.extension || 'mp4',
            size: item.sizeText || 'Unknown size',
            url: item.url,
            hasAudio: item.hasAudio ?? true,
            isAudioOnly: false
          });
        }
      });
    }

    // Parse Audios
    if (data.audios && data.audios.items) {
        data.audios.items.forEach((item: any) => {
          if (item.url) {
            formats.push({
              quality: 'Audio',
              container: item.extension || 'mp3',
              size: item.sizeText || 'Unknown size',
              url: item.url,
              hasAudio: true,
              isAudioOnly: true
            });
          }
        });
      }

    return formats;
  } catch (error) {
    console.error("Error fetching download links:", error);
    throw new Error("Failed to retrieve download links from Lanka Cinema Server.");
  }
};