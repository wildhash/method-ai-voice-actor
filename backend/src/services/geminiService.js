import { getGeminiModel } from '../config/gemini.js';

export const rewriteText = async (text, characterPrompt) => {
  try {
    const model = getGeminiModel();
    const prompt = `${characterPrompt}\n\nRewrite the following text in character:\n${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in Gemini service:', error);
    throw error;
  }
};

export const generateCharacterDialogue = async (scenario, characterName, characterTraits) => {
  try {
    const model = getGeminiModel();
    const prompt = `You are ${characterName}, a character with these traits: ${characterTraits}.
    
Given this scenario: ${scenario}

Generate a natural, in-character response as ${characterName}.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating character dialogue:', error);
    throw error;
  }
};
