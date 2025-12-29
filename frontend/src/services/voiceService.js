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
    // Check for rate limit error
    if (error.response?.status === 429) {
      const data = error.response.data;
      // Convert blob to JSON if needed
      if (data instanceof Blob) {
        const text = await data.text();
        const parsed = JSON.parse(text);
        throw { 
          isRateLimited: true, 
          ...parsed 
        };
      }
      throw { isRateLimited: true, ...data };
    }
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

export const getVoiceStatus = async () => {
  try {
    const response = await api.get('/voice/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching voice status:', error);
    throw error;
  }
};

export const getVoiceTiers = async () => {
  try {
    const response = await api.get('/voice/tiers');
    return response.data;
  } catch (error) {
    console.error('Error fetching voice tiers:', error);
    throw error;
  }
};
