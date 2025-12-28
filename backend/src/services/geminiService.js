import { getVertexAIModel } from '../config/gemini.js';

/**
 * Method Actor rewrite function - rewrites text in a specific persona
 * @param {string} text - The original text to rewrite
 * @param {string} persona - The persona description
 * @param {string} modelName - Optional model name (default: gemini-3.0-flash)
 * @returns {Promise<string>} The rewritten text in character
 */
export const rewriteTextAsMethodActor = async (text, persona, modelName = 'gemini-3.0-flash') => {
  try {
    const model = getVertexAIModel(modelName);
    
    // Sanitize inputs to prevent prompt injection
    const sanitizedText = text.trim();
    const sanitizedPersona = persona.trim();
    
    if (!sanitizedText) {
      throw new Error('Text cannot be empty');
    }
    
    if (!sanitizedPersona) {
      throw new Error('Persona description cannot be empty');
    }
    
    const systemInstruction = `You are a master method actor. Your goal is to rewrite the provided text effectively into the voice of a specific Persona.
Persona: ${sanitizedPersona}
Rules:
1. Keep the core information and facts accurate.
2. Change the vocabulary, sentence structure, and tone to match the persona perfectly.
3. Do not add 'Here is the rewritten text' preamble. Just start acting.`;
    
    const prompt = `${systemInstruction}\n\nText to rewrite:\n${sanitizedText}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in Method Actor rewrite:', error);
    throw error;
  }
};

// Legacy function for backward compatibility
export const rewriteText = async (text, characterPrompt) => {
  try {
    const model = getVertexAIModel('gemini-3.0-flash');
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
    const model = getVertexAIModel('gemini-3.0-flash');
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
