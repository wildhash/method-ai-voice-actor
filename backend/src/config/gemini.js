import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with validation
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

let genAI;

const initializeGenAI = () => {
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY or GOOGLE_API_KEY environment variable is required. ' +
      'Please set it in your .env file.'
    );
  }
  
  return new GoogleGenerativeAI(apiKey);
};

export const getGeminiModel = (modelName = 'gemini-flash-latest', generationConfig = null) => {
  if (!genAI) {
    genAI = initializeGenAI();
  }
  
  const modelConfig = { model: modelName };
  
  if (generationConfig) {
    modelConfig.generationConfig = generationConfig;
  } else {
    modelConfig.generationConfig = {
      maxOutputTokens: 2048,
      temperature: 0.9,
      topP: 0.95,
    };
  }
  
  return genAI.getGenerativeModel(modelConfig);
};

// Alias for compatibility with existing code that calls getVertexAIModel
export const getVertexAIModel = getGeminiModel;

export default genAI;
