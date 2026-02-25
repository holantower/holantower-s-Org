export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  LIVE = 'LIVE',
  VISION = 'VISION',
  STUDIO = 'STUDIO',
  SETTINGS = 'SETTINGS'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface AppConfig {
  apiKey: string; // Not stored, just passed for context if needed, though we use process.env usually
}

export const MODELS = {
  CHAT: 'gemini-3-flash-preview',
  VISION: 'gemini-2.5-flash-image', // Good for general image tasks
  LIVE: 'gemini-2.5-flash-native-audio-preview-12-2025',
  IMAGE_GEN: 'gemini-2.5-flash-image', // Can adhere to prompt for editing/gen
  COMPLEX: 'gemini-3-pro-preview'
};
