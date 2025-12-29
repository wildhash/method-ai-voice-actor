import { getVertexAIModel } from '../config/gemini.js';

/**
 * Method Actor rewrite function - rewrites text in a specific persona
 */
export const rewriteTextAsMethodActor = async (text, persona, modelName = 'gemini-flash-latest') => {
  try {
    const model = getVertexAIModel(modelName);
    
    const sanitizedText = text.trim();
    const sanitizedPersona = persona.trim();
    
    if (!sanitizedText) throw new Error('Text cannot be empty');
    if (!sanitizedPersona) throw new Error('Persona description cannot be empty');
    
    const systemInstruction = `You are a master method actor. Rewrite the provided text in the voice of a specific Persona.
Persona: ${sanitizedPersona}
Rules:
1. Keep the core information and facts accurate.
2. Change the vocabulary, sentence structure, and tone to match the persona perfectly.
3. Do not add preamble. Just start acting.`;
    
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
 */
export const chatWithPersona = async (userMessage, persona, history = []) => {
  try {
    const model = getVertexAIModel('gemini-flash-latest');
    
    const systemInstruction = `You are a method actor staying completely in character.
Your Character: ${persona}

Rules:
1. Respond naturally to the user's line as your character.
2. Stay 100% in character. Never break character.
3. Keep responses concise (1-3 sentences).
4. React emotionally to what the user says.
5. No stage directions or asterisks.`;

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
 * Generate a dialogue scene based on a prompt
 * Optimized for voice rehearsal - uses simple CHARACTER: dialogue format
 */
export const generateScript = async (prompt) => {
  try {
    const model = getVertexAIModel('gemini-flash-latest');
    
    const systemInstruction = `You are an expert dialogue writer for voice acting rehearsals.

CRITICAL FORMAT RULES:
1. Use ONLY this format: CHARACTER: Their dialogue here
2. Character names must be a single word in ALL CAPS followed by a colon
3. NO scene headings (no INT./EXT.)
4. NO parentheticals or stage directions
5. NO action lines or descriptions
6. ONLY dialogue lines, nothing else
7. Each line should be speakable (2-4 sentences max)
8. Create 2-4 distinct characters with unique voices
9. Write 8-15 lines of dialogue total

GOOD EXAMPLE:
MARCUS: I've been waiting for you. Did you think you could hide forever?
ELENA: I wasn't hiding. I was preparing.
MARCUS: Preparing for what exactly?
ELENA: For this moment. The moment I finally tell you the truth.

BAD EXAMPLE (DO NOT DO THIS):
INT. WAREHOUSE - NIGHT
MARCUS (angrily)
I've been waiting for you.
(He steps forward)

Output ONLY the dialogue lines. No explanations, no markdown, no scene descriptions.`;

    const fullPrompt = `${systemInstruction}\n\nWrite a dialogue scene about: ${prompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating script:', error);
    throw error;
  }
};
