
import axios from 'axios';

const IMGBB_API_KEY = '4c2fc7f80627fab6a73c02bad086f632';

export const uploadImageToImgBB = async (imageFile: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData);
    return response.data.data.url;
  } catch (error: any) {
    console.error("ImgBB Upload Error:", error?.message || String(error));
    throw new Error("Failed to upload image. Please try again.");
  }
};
