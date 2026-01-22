
// Correctly import GoogleGenAI from @google/genai
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

let chat: Chat | null = null;

// Always initialize GoogleGenAI using a named parameter with process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const initGemini = () => {
  try {
    // Use ai.chats.create with recommended model and config structure
    chat = ai.chats.create({ 
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are a helpful and knowledgeable movie and TV series assistant for a website called "MOVIE HUB". 
        Your goal is to help users find movies, provide facts, explain plots (without spoilers unless asked), and recommend content based on their mood or preferences.
        Keep answers concise and engaging. If you mention a movie, try to include the release year.
        You are witty and love cinema.`
      }
    });
  } catch (error: any) {
    // Extract message to avoid circular structure errors
    console.error("Failed to initialize Gemini:", error?.message || String(error));
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chat) {
    initGemini();
  }
  
  if (!chat) {
      return "I'm sorry, I cannot connect to the AI service right now. Please check your API configuration.";
  }

  try {
    // Use chat.sendMessage with message parameter and handle response.text property
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    // Extract message to avoid circular structure errors
    console.error("Gemini Error:", error?.message || String(error));
    return "I had some trouble thinking about that. Try again?";
  }
};
