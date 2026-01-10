import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

export const initGemini = () => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing.");
    return;
  }
  genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  chatSession = genAI.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are a helpful and knowledgeable movie and TV series assistant for a website called "MOVIE HUB". 
      Your goal is to help users find movies, provide facts, explain plots (without spoilers unless asked), and recommend content based on their mood or preferences.
      Keep answers concise and engaging. If you mention a movie, try to include the release year.
      You are witty and love cinema.`,
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    initGemini();
  }
  
  if (!chatSession) {
      return "I'm sorry, I cannot connect to the AI service right now. Please check your API configuration.";
  }

  try {
    const response = await chatSession.sendMessage({ message });
    return response.text || "I'm speechless!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I had some trouble thinking about that. Try again?";
  }
};
