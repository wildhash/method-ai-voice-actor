import api from './api';

export const synthesizeSpeech = async (text, voiceId) => {
  try {
    const response = await api.post('/voice/synthesize', {
      text,
      voiceId,
    }, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw error;
  }
};

export const getVoices = async () => {
  try {
    const response = await api.get('/voice/voices');
    return response.data;
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw error;
  }
};
