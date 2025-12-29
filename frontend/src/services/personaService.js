import api from './api';

/**
 * Fetch all personas (default + custom)
 */
export const getAllPersonas = async () => {
  try {
    const response = await api.get('/personas');
    return response.data;
  } catch (error) {
    console.error('Error fetching personas:', error);
    throw error;
  }
};

/**
 * Create a new custom persona
 * @param {string} name - Character name
 * @param {string} description - Character description/vibe
 * @param {string} [voiceId] - Optional voice ID
 */
export const createPersona = async (name, description, voiceId = null) => {
  try {
    const response = await api.post('/personas/create', {
      name,
      description,
      voiceId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating persona:', error);
    throw error;
  }
};

/**
 * Delete a custom persona
 * @param {string} personaId - The ID of the persona to delete
 */
export const deletePersona = async (personaId) => {
  try {
    const response = await api.delete(`/personas/${personaId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting persona:', error);
    throw error;
  }
};
