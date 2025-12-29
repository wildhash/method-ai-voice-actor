import { getVertexAIModel } from '../config/gemini.js';

/**
 * Method Actor rewrite function - rewrites text in a specific persona
 * @param {string} text - The original text to rewrite
 * @param {string} persona - The persona description
 * @param {string} modelName - Optional model name (default: gemini-3.0-flash)
 * @returns {Promise<string>} The rewritten text in character
 */
export const rewriteTextAsMethodActor = async (text, persona, modelName = 'gemini-flash-latest') => {
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

/**
 * Chat with a persona - interactive scene rehearsal
 * @param {string} userMessage - The user's line
 * @param {string} persona - The persona description
 * @param {Array} history - Previous messages in the conversation
 * @returns {Promise<string>} The persona's response
 */
export const chatWithPersona = async (userMessage, persona, history = []) => {
  try {
    const model = getVertexAIModel('gemini-flash-latest');
    
    const systemInstruction = `You are a method actor staying completely in character.
Your Character: ${persona}

Context: You are in a scene with another actor (the user).
Rules:
1. Respond naturally to the user's line as your character.
2. Stay 100% in character. Never break character.
3. Keep responses concise (1-3 sentences) unless a monologue is required.
4. React emotionally to what the user says.
5. Do not include stage directions like *looks angry* unless absolutely necessary for the voice performance.`;

    // Construct the chat history for the prompt
    let prompt = `${systemInstruction}\n\nScene History:\n`;
    
    history.forEach(msg => {
      const role = msg.role === 'user' ? 'Other Actor' : 'You';
      prompt += `${role}: ${msg.content}\n`;
    });
    
    prompt += `\nOther Actor: ${userMessage}\nYou:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in chat with persona:', error);
    throw error;
  }
};

// Legacy function for backward compatibility
export const rewriteText = async (text, characterPrompt) => {
  try {
    const model = getVertexAIModel('gemini-flash-latest');
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
    const model = getVertexAIModel('gemini-flash-latest');
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

/**
 * Generate a screenplay scene based on a prompt
 * @param {string} prompt - The scene description
 * @returns {Promise<string>} The generated script
 */
export const generateScript = async (prompt) => {
  try {
    const model = getVertexAIModel('gemini-flash-latest');
    
    const systemInstruction = `You are an expert screenwriter. Write a scene based on the user's prompt.
Format: Standard Screenplay Format.
1. Start with a Scene Heading (e.g., INT. COFFEE SHOP - DAY).
2. Use character names in ALL CAPS centered above dialogue.
3. Include parentheticals for delivery instructions if needed.
4. Keep it under 3 pages.
5. Ensure distinct voices for characters.
6. Output ONLY the script content, no markdown code blocks or explanations.`;

    const fullPrompt = `${systemInstruction}\n\nPrompt: ${prompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating script:', error);
    throw error;
  }
};

