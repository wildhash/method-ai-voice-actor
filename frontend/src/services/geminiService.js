import api from './api';

export const rewriteText = async (text, characterPrompt) => {
  try {
    const response = await api.post('/gemini/rewrite', {
      text,
      characterPrompt,
    });
    return response.data;
  } catch (error) {
    console.error('Error rewriting text:', error);
    throw error;
  }
};

export const generateDialogue = async (scenario, characterName, characterTraits) => {
  try {
    const response = await api.post('/gemini/generate-dialogue', {
      scenario,
      characterName,
      characterTraits,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating dialogue:', error);
    throw error;
  }
};

export const generateScript = async (prompt) => {
  try {
    const response = await api.post('/gemini/generate-script', {
      prompt,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating script:', error);
    throw error;
  }
};

