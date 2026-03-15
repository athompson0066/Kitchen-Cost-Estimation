import { GoogleGenAI } from "@google/genai";

export const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("Gemini API Key is missing or invalid. Please ensure it is configured in the AI Studio Secrets panel.");
  }
  
  return new GoogleGenAI({ apiKey });
};
