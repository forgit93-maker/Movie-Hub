import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";

let chatSession: ChatSession | null = null;
let genAI: GoogleGenerativeAI | null = null;

export const initGemini = () => {
  const apiKey = typeof process !== "undefined" ? process.env?.API_KEY : undefined;
  
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return;
  }
  
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: {
        role: "system",
        parts: [{ text: `You are a helpful and knowledgeable movie and TV series assistant for a website called "MOVIE HUB". 
        Your goal is to help users find movies, provide facts, explain plots (without spoilers unless asked), and recommend content based on their mood or preferences.
        Keep answers concise and engaging. If you mention a movie, try to include the release year.
        You are witty and love cinema.` }]
      }
    });
    
    chatSession = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });
  } catch (error) {
    console.error("Failed to initialize Gemini:", error);
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    initGemini();
  }
  
  if (!chatSession) {
      return "I'm sorry, I cannot connect to the AI service right now. Please check your API configuration.";
  }

  try {
    const result = await chatSession.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I had some trouble thinking about that. Try again?";
  }
};