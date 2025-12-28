import { getElevenLabsClient } from '../config/elevenlabs.js';

export const textToSpeech = async (text, voiceId = 'default') => {
  try {
    const elevenlabs = getElevenLabsClient();
    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text,
      model_id: 'eleven_monolingual_v1',
    });
    
    return audio;
  } catch (error) {
    console.error('Error in ElevenLabs service:', error);
    throw error;
  }
};

export const getAvailableVoices = async () => {
  try {
    const elevenlabs = getElevenLabsClient();
    const voices = await elevenlabs.voices.getAll();
    return voices;
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw error;
  }
};
