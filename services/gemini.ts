import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MODELS } from '../types';

// Ensure API Key is available
const apiKey = process.env.API_KEY || '';

// Singleton instance
let ai: GoogleGenAI | null = null;

export const getGeminiClient = () => {
  if (!ai) {
    if (!apiKey) {
      console.error("API_KEY is missing from environment");
      throw new Error("API Key missing");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const generateText = async (prompt: string, model: string = MODELS.CHAT): Promise<string> => {
  const client = getGeminiClient();
  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Generate Error:", error);
    throw error;
  }
};

export const generateImageDescription = async (base64Image: string, prompt: string): Promise<string> => {
  const client = getGeminiClient();
  try {
    const response = await client.models.generateContent({
      model: MODELS.VISION,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG for simplicity in this wrapper, handle dynamic in real app
              data: base64Image
            }
          },
          { text: prompt }
        ]
      }
    });
    return response.text || "Could not analyze image.";
  } catch (error) {
    console.error("Vision Error:", error);
    throw error;
  }
};
